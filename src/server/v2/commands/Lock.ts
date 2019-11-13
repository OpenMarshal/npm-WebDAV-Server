import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType, SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { extractOneToken } from '../../../helper/v2/IfParser'
import { LockScope } from '../../../resource/v2/lock/LockScope'
import { LockKind } from '../../../resource/v2/lock/LockKind'
import { LockType } from '../../../resource/v2/lock/LockType'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/v2/lock/Lock'
import { XML, XMLElementBuilder } from 'xml-js-builder'

function createResponse(ctx : HTTPRequestContext, lock : Lock)
{
    const prop = new XMLElementBuilder('D:prop', {
        'xmlns:D': 'DAV:'
    });
    const activelock = prop.ele('D:lockdiscovery').ele('D:activelock');

    activelock.ele('D:locktype').ele(lock.lockKind.type.value);
    activelock.ele('D:lockscope').ele(lock.lockKind.scope.value);
    activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid);
    activelock.ele('D:lockroot').ele('D:href', undefined, true).add(HTTPRequestContext.encodeURL(ctx.fullUri()));
    activelock.ele('D:depth').add(lock.depth === -1 ? 'infinity' : lock.depth.toString());
    if(lock.owner)
        activelock.ele('D:owner').add(lock.owner);
    activelock.ele('D:timeout').add(`Second-${lock.lockKind.timeout}`);

    return prop;
}

function createLock(ctx : HTTPRequestContext, data : Buffer, callback)
{
    try
    {
        const xml = XML.parse(data as any);
        const root = xml.find('DAV:lockinfo');
        
        const scope = new LockScope(root.find('DAV:lockscope').elements[0].name.substr(4).toLowerCase());
        const type = new LockType(root.find('DAV:locktype').elements[0].name.substr(4).toLowerCase());
        const ownerElementIndex = root.findIndex('DAV:owner');
        const owner = ownerElementIndex !== -1 ? root.elements[ownerElementIndex].elements : null;

        const lock = new Lock(new LockKind(scope, type, ctx.server.options.lockTimeout), ctx.user ? ctx.user.uid : undefined, owner, ctx.headers.depth === undefined ? -1 : ctx.headers.depth);

        const go = (r : Resource, callback : SimpleCallback) =>
        {
            ctx.overridePrivileges = true;
            r.listDeepLocks((e, locks) => {
                ctx.overridePrivileges = false;
                if(e)
                    return callback(e);
                
                if(Object.keys(locks).length > 0)
                {
                    if(LockScope.Exclusive.isSame(type))
                        return callback(Errors.Locked);

                    for(const path in locks)
                        if(locks[path].some((l) => LockScope.Exclusive.isSame(l.lockKind.scope)))
                            return callback(Errors.Locked);
                }

                r.lockManager((e, lm) => {
                    if(e)
                        return callback(e);
                    
                    lm.setLock(lock, (e) => {
                        if(e)
                            return callback(e);
                        
                        //ctx.invokeEvent('lock', r, lock);
                        ctx.response.setHeader('Lock-Token', lock.uuid);
                        callback();
                    })
                })
            })
        }

        const _callback = callback;
        callback = (e) => {
            if(e)
            {
                if(!ctx.setCodeFromError(e))
                    ctx.setCode(HTTPCodes.InternalServerError)
            }
            else
                ctx.writeBody(createResponse(ctx, lock));
            _callback();
        }

        ctx.getResource((e, r) => {
            go(r, (e) => {
                if(e === Errors.ResourceNotFound)
                    r.create(ResourceType.File, (e) => {
                        if(e)
                            return callback(e);
                        
                        ctx.setCode(HTTPCodes.Created);
                        go(r, callback);
                    })
                else if(e)
                    callback(e);
                else
                    callback();
            })
        })
    }
    catch(ex)
    {
        ctx.setCode(HTTPCodes.BadRequest);
        callback();
        return;
    }
}

function refreshLock(ctx : HTTPRequestContext, lockUUID : string, callback)
{
    ctx.getResource((e, r) => {
        //ctx.requirePrivilege([ 'canSetLock', 'canGetLock' ], r, () => {
            r.lockManager((e, lm) => {
                if(e)
                {
                    if(!ctx.setCodeFromError(e))
                        ctx.setCode(HTTPCodes.InternalServerError)
                    return callback();
                }
                
                lm.refresh(lockUUID, ctx.server.options.lockTimeout, (e, lock) => {
                    if(e || !lock)
                    {
                        ctx.setCode(HTTPCodes.PreconditionFailed)
                        callback()
                        return;
                    }
                    
                    //ctx.invokeEvent('refreshLock', r, lock);
                    ctx.setCode(HTTPCodes.OK);
                    ctx.writeBody(createResponse(ctx, lock));
                    callback();
                })
            })
        //})
    })
}

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        if(!ctx.user)
        {
            ctx.setCode(HTTPCodes.Forbidden);
            return callback();
        }

        if(ctx.headers.contentLength > 0)
        {
            createLock(ctx, data, callback);
            return;
        }
        
        const ifHeader = ctx.headers.find('If');
        if(!ifHeader)
        {
            ctx.setCode(HTTPCodes.PreconditionRequired);
            return callback();
        }

        refreshLock(ctx, extractOneToken(ifHeader), callback);
    }
}
