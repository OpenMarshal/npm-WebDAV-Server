import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { FSPath } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'
import * as path from 'path'

export function method(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.checkIfHeader(undefined, () => {
            arg.getResource((e, r) => {
                if(e !== Errors.ResourceNotFound)
                {
                    arg.setCode(HTTPCodes.MethodNotAllowed);
                    callback();
                    return;
                }
                
                arg.server.getResourceFromPath(arg, arg.path.getParent(), (e, r) => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.Conflict)
                        callback();
                        return;
                    }
                    
                    arg.requirePrivilege([ 'canAddChild' ], r, () => {
                        if(!r.fsManager)
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                            return;
                        }
                        
                        const resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), ResourceType.Directory, r);
                        arg.requirePrivilege([ 'canCreate' ], resource, () => {
                            resource.create((e) => process.nextTick(() => {
                                if(e)
                                {
                                    arg.setCode(HTTPCodes.InternalServerError)
                                    callback();
                                    return;
                                }
                            
                                arg.invokeEvent('create', resource);
                                r.addChild(resource, (e) => process.nextTick(() => {
                                    if(e)
                                        arg.setCode(HTTPCodes.InternalServerError)
                                    else
                                    {
                                        arg.invokeEvent('addChild', r, resource);
                                        arg.setCode(HTTPCodes.Created)
                                    }
                                    callback();
                                }))
                            }))
                        })
                    })
                })
            })
        })
    })
}

(method as WebDAVRequest).isValidFor = function(type : ResourceType)
{
    return !type;
};

export default method;
