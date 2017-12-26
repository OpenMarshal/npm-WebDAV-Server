import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { Errors, HTTPError } from '../../../Errors'
import * as path from 'path'

function createResource(arg : MethodCallArgs, callback, validCallback : (resource : IResource) => void)
{
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
                    r.addChild(resource, (e) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                        }
                        else
                        {
                            arg.invokeEvent('addChild', r, resource);
                            validCallback(resource);
                        }
                    }))
                }))
            })
        })
    })
}

export default function unchunkedMethod(arg : MethodCallArgs, callback)
{
    const targetSource = arg.isSource;

    arg.getResource((e, r) => {
        if(e && e !== Errors.ResourceNotFound)
        {
            arg.setCode(HTTPCodes.InternalServerError);
            callback();
            return;
        }

        arg.checkIfHeader(r, () => {
            if(arg.contentLength === 0)
            { // Create file
                if(r)
                { // Resource exists => empty it
                    arg.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                        r.write(targetSource, (e, stream) => process.nextTick(() => {
                            if(stream)
                                stream.end();

                            if(e)
                                arg.setCode(HTTPCodes.InternalServerError)
                            else
                            {
                                arg.invokeEvent('write', r);
                                arg.setCode(HTTPCodes.OK)
                            }
                            callback()
                        }), arg.contentLength)
                    })
                    return;
                }
                
                createResource(arg, callback, (r) => {
                    arg.setCode(HTTPCodes.Created)
                    callback();
                })
            }
            else
            { // Write to a file
                if(e)
                { // Resource not found
                    createResource(arg, callback, (r) => {
                        r.write(targetSource, (e, stream) => process.nextTick(() => {
                            if(e)
                            {
                                arg.setCode(HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }

                            stream.end(arg.data, (e) => {
                                if(e)
                                    arg.setCode(HTTPCodes.InternalServerError)
                                else
                                {
                                    arg.invokeEvent('write', r);
                                    arg.setCode(HTTPCodes.Created)
                                }
                                callback();
                            });
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

                        r.write(targetSource, (e, stream) => process.nextTick(() => {
                            if(e)
                            {
                                arg.setCode(HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }

                            stream.end(arg.data, (e) => {
                                if(e)
                                    arg.setCode(HTTPCodes.InternalServerError)
                                else
                                {
                                    arg.invokeEvent('write', r);
                                    arg.setCode(HTTPCodes.OK)
                                }
                                callback();
                            });
                        }), arg.contentLength)
                    }))
                })
            }
        })
    })
}

(unchunkedMethod as WebDAVRequest).isValidFor = function(type : ResourceType)
{
    return !type || type.isFile;
};

(unchunkedMethod as WebDAVRequest).chunked = function(arg : MethodCallArgs, callback)
{
    const targetSource = arg.isSource;

    arg.getResource((e, r) => {
        if(e && e !== Errors.ResourceNotFound)
        {
            arg.setCode(HTTPCodes.InternalServerError);
            callback();
            return;
        }

        arg.checkIfHeader(r, () => {
            if(e)
            { // Resource not found
                createResource(arg, callback, (r) => {
                    r.write(targetSource, (e, stream) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }

                        arg.request.pipe(stream);
                        stream.on('finish', () => {
                            arg.setCode(HTTPCodes.Created)
                            arg.invokeEvent('write', r);
                            callback();
                        });
                        stream.on('error', (e) => {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                        });
                    }), arg.contentLength)
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

                    r.write(targetSource, (e, stream) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }

                        arg.request.pipe(stream);
                        stream.on('finish', (e) => {
                            arg.setCode(HTTPCodes.OK)
                            arg.invokeEvent('write', r);
                            callback();
                        });
                        stream.on('error', (e) => {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                        });
                    }), arg.contentLength)
                }))
            })
        })
    })
}
