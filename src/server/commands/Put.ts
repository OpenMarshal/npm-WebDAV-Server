import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/Resource'
import * as path from 'path'

function createResource(arg : MethodCallArgs, callback, validCallback : (resource : IResource) => void)
{
    arg.server.getResourceFromPath(arg.path.getParent(), (e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.MethodNotAllowed)
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
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                        }
                        else
                            validCallback(resource);
                    })
                })
            })
        })
    })
}

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(arg.contentLength === 0)
        { // Create file
            if(r)
            { // Resource exists => empty it
                arg.requirePrivilege([ 'canWrite' ], r, () => {
                    r.write(new Buffer(0), (e) => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.OK)
                        callback()
                    })
                })
                return;
            }
            
            createResource(arg, callback, (r) => {
                arg.setCode(HTTPCodes.OK)
                callback();
            })
        }
        else
        { // Write to a file
            var data = new Buffer(arg.data);

            if(e)
            { // Resource not found
                createResource(arg, callback, (r) => {
                    r.write(data, (e) => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.OK)
                        callback();
                    })
                })
                return;
            }

            arg.requirePrivilege([ 'canWrite' ], r, () => {
                r.write(data, (e) => {
                    if(e)
                        arg.setCode(HTTPCodes.InternalServerError)
                    else
                        arg.setCode(HTTPCodes.OK)
                    callback();
                })
            })
        }
    })
}
