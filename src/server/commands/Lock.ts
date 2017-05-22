import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/IResource'
import { LockScope } from '../../resource/lock/LockScope'
import { LockKind } from '../../resource/lock/LockKind'
import { LockType } from '../../resource/lock/LockType'
import { Errors } from '../../Errors'
import { Lock } from '../../resource/lock/Lock'
import { XML } from '../../helper/XML'
import * as path from 'path'

export default function(arg : MethodCallArgs, callback)
{
    try
    {
        if(!arg.user)
        {
            arg.setCode(HTTPCodes.Forbidden);
            callback();
            return;
        }

        const xml = XML.parse(arg.data);
        const root = xml.find('DAV:lockinfo');
        
        const scope = new LockScope(root.find('DAV:lockscope').elements[0].name.substr(4).toLowerCase());
        const type = new LockType(root.find('DAV:locktype').elements[0].name.substr(4).toLowerCase());
        const ownerElement = root.find('DAV:owner');
        const owner = ownerElement ? ownerElement.elements : null;

        const lock = new Lock(new LockKind(scope, type, arg.server.options.lockTimeout), arg.user, owner);

        arg.getResource((e, r) => {
            if(e === Errors.ResourceNotFound)
            { // create the resource
                
                arg.server.getResourceFromPath(arg.path.getParent(), (e, r) => {
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
                            resource.create((e) => {
                                if(e)
                                {
                                    arg.setCode(HTTPCodes.InternalServerError)
                                    callback();
                                    return;
                                }
                            
                                r.addChild(resource, (e) => {
                                    if(e)
                                        arg.setCode(HTTPCodes.InternalServerError);
                                    else
                                        arg.setCode(HTTPCodes.Created);
                                    callback();
                                })
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

            arg.requirePrivilege([ 'canSetLock' ], r, () => {
                r.setLock(lock, (e) => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.Locked);
                        callback();
                        return;
                    }
                    
                    const prop = XML.createElement('D:prop', {
                        'xmlns:D': 'DAV:'
                    });
                    const activelock = prop.ele('D:lockdiscovery').ele('D:activelock');

                    activelock.ele('D:locktype').ele(type.value);
                    activelock.ele('D:lockscope').ele(type.value);
                    activelock.ele('D:locktoken').ele('D:href').add(lock.uuid);
                    activelock.ele('D:lockroot').add(arg.fullUri());
                    activelock.ele('D:depth').add('infinity');
                    activelock.ele('D:owner').add(owner);
                    activelock.ele('D:timeout').add('Second-' + lock.lockKind.timeout);

                    arg.response.setHeader('Lock-Token', lock.uuid);
                    arg.setCode(HTTPCodes.OK);
                    arg.writeXML(prop);
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
