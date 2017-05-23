import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/IResource'
import { Errors } from '../../Errors'
import * as path from 'path'

function createResource(arg : MethodCallArgs, callback, validCallback : (resource : IResource) => void)
{
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
                resource.create((e) => process.nextTick(() => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.InternalServerError)
                        callback();
                        return;
                    }
                
                    r.addChild(resource, (e) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                        }
                        else
                            validCallback(resource);
                    }))
                }))
            })
        })
    })
}

export default function(arg : MethodCallArgs, callback)
{
    const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

    arg.getResource((e, r) => {
        if(e && e !== Errors.ResourceNotFound)
        {
            arg.setCode(HTTPCodes.InternalServerError);
            callback();
            return;
        }

        if(arg.contentLength === 0)
        { // Create file
            if(r)
            { // Resource exists => empty it
                arg.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                    r.write(new Buffer(0), targetSource, (e) => process.nextTick(() => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.OK)
                        callback()
                    }))
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
            const data = new Buffer(arg.data);

            if(e)
            { // Resource not found
                createResource(arg, callback, (r) => {
                    r.write(data, targetSource, (e) => process.nextTick(() => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.OK)
                        callback();
                    }))
                })
                return;
            }

            arg.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                r.type((e, type) => process.nextTick(() => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    if(!type.isFile)
                    {
                        arg.setCode(HTTPCodes.MethodNotAllowed);
                        callback();
                        return;
                    }

                    r.write(data, targetSource, (e) => process.nextTick(() => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.OK)
                        callback();
                    }))
                }))
            })
        }
    })
}
