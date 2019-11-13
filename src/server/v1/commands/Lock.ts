import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { extractOneToken } from '../../../helper/v1/IfParser'
import { LockScope } from '../../../resource/v1/lock/LockScope'
import { LockKind } from '../../../resource/v1/lock/LockKind'
import { LockType } from '../../../resource/v1/lock/LockType'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/v1/lock/Lock'
import { XML, XMLElementBuilder } from 'xml-js-builder'
import * as path from 'path'

function createResponse(arg : MethodCallArgs, lock : Lock)
{
    const prop = new XMLElementBuilder('D:prop', {
        'xmlns:D': 'DAV:'
    });
    const activelock = prop.ele('D:lockdiscovery').ele('D:activelock');

    activelock.ele('D:locktype').ele(lock.lockKind.type.value);
    activelock.ele('D:lockscope').ele(lock.lockKind.scope.value);
    activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid);
    activelock.ele('D:lockroot').add(arg.fullUri());
    activelock.ele('D:depth').add('infinity');
    if(lock.owner)
        activelock.ele('D:owner').add(lock.owner);
    activelock.ele('D:timeout').add('Second-' + lock.lockKind.timeout);

    return prop;
}

function createLock(arg : MethodCallArgs, callback)
{
    try
    {
        const xml = XML.parse(arg.data as any);
        const root = xml.find('DAV:lockinfo');
        
        const scope = new LockScope(root.find('DAV:lockscope').elements[0].name.substr(4).toLowerCase());
        const type = new LockType(root.find('DAV:locktype').elements[0].name.substr(4).toLowerCase());
        const ownerElement = root.find('DAV:owner');
        const owner = ownerElement ? ownerElement.elements : null;

        const lock = new Lock(new LockKind(scope, type, arg.server.options.lockTimeout), arg.user, owner);

        arg.getResource((e, r) => {
            if(e === Errors.ResourceNotFound)
            { // create the resource
                
                arg.checkIfHeader(undefined, () => {
                    arg.server.getResourceFromPath(arg, arg.path.getParent(), (e, r) => {
                        if(e)
                        {
                            arg.setCode(e === Errors.ResourceNotFound ? HTTPCodes.Conflict : HTTPCodes.InternalServerError)
                            callback()
                            return;
                        }
                        
                        if(!r.fsManager)
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                            return;
                        }

                        arg.requirePrivilege([ 'canAddChild' ], r, () => {
                            const resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), ResourceType.File, r);
                            arg.requirePrivilege([ 'canCreate', 'canWrite' ], resource, () => {
                                resource.create((e) => process.nextTick(() => {
                                    if(e)
                                    {
                                        arg.setCode(HTTPCodes.InternalServerError)
                                        callback();
                                        return;
                                    }
                                
                                    arg.invokeEvent('create', resource);
                                    r.addChild(resource, (e) => {
                                        if(e)
                                        {
                                            arg.setCode(HTTPCodes.InternalServerError);
                                            callback();
                                        }
                                        else
                                        {
                                            arg.invokeEvent('addChild', r, resource);
                                            writeLock(resource, () => {
                                                arg.setCode(HTTPCodes.Created);
                                                arg.writeXML(createResponse(arg, lock));
                                                callback();
                                            });
                                        }
                                    })
                                }))
                            })
                        })
                    })
                })

                return;
            }

            if(e)
            {
                arg.setCode(HTTPCodes.InternalServerError);
                callback();
                return;
            }

            function writeLock(r : IResource, cb)
            {
                arg.requirePrivilege([ 'canSetLock' ], r, () => {
                    r.setLock(lock, (e) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.Locked);
                            callback();
                            return;
                        }
                        
                        arg.invokeEvent('lock', r, lock);
                        arg.response.setHeader('Lock-Token', lock.uuid);
                        cb();
                    }))
                })
            }

            arg.checkIfHeader(r, () => {
                writeLock(r, () => {
                    arg.setCode(HTTPCodes.OK);
                    arg.writeXML(createResponse(arg, lock));
                    callback();
                })
            })
        })
    }
    catch(ex)
    {
        arg.setCode(HTTPCodes.BadRequest);
        callback();
        return;
    }
}

function refreshLock(arg : MethodCallArgs, lockUUID : string, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(e === Errors.ResourceNotFound ? HTTPCodes.NotFound : HTTPCodes.InternalServerError)
            callback()
            return;
        }

        arg.requirePrivilege([ 'canSetLock', 'canGetLock' ], r, () => {
            r.getLock(lockUUID, (e, lock) => {
                if(e || !lock)
                {
                    arg.setCode(HTTPCodes.PreconditionFailed)
                    callback()
                    return;
                }
                
                lock.refresh();
                
                arg.invokeEvent('refreshLock', r, lock);
                arg.setCode(HTTPCodes.OK);
                arg.writeXML(createResponse(arg, lock));
                callback();
            })
        })
    })
}

export default function(arg : MethodCallArgs, callback)
{
    if(!arg.user)
    {
        arg.setCode(HTTPCodes.Forbidden);
        callback();
        return;
    }

    if(arg.contentLength > 0)
    {
        createLock(arg, callback);
        return;
    }
    
    const ifHeader = arg.findHeader('If');
    if(!ifHeader)
    {
        arg.setCode(HTTPCodes.PreconditionRequired);
        callback();
        return;
    }

    refreshLock(arg, extractOneToken(ifHeader), callback);
}
