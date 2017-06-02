import { HTTPCodes, MethodCallArgs, WebDAVRequest, StartChunkedCallback } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/IResource'
import { Errors, HTTPError } from '../../Errors'
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

export default function unchunkedMethod(arg : MethodCallArgs, callback)
{
    const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

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
                                    arg.setCode(HTTPCodes.OK)
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
                                    arg.setCode(HTTPCodes.OK)
                                callback();
                            });
                        }))
                    }))
                })
            }
        })
    })
}
/*
function asyncWrite(arg : MethodCallArgs, callback : StartChunkedCallback, resource : IResource, targetSource : boolean)
{
    function errorCallback(isLast : boolean)
    {
        return (error : Error) => {
            if(error)
                callback(new HTTPError(HTTPCodes.InternalServerError, error), null)
            else if(isLast)
            {
                arg.setCode(HTTPCodes.OK);
                arg.exit();
            }
        }
    }

    callback(null, (data, isFirst, isLast) => {
        if(isFirst)
            resource.write(data, targetSource, errorCallback(isLast))
        else
            resource.append(data, targetSource, errorCallback(isLast))
    })
}

(unchunkedMethod as WebDAVRequest).startChunked = function(arg : MethodCallArgs, callback : StartChunkedCallback)
{
    const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

    arg.getResource((e, r) => {
        if(e && e !== Errors.ResourceNotFound)
        {
            callback(new HTTPError(HTTPCodes.InternalServerError, e), null);
            return;
        }

        arg.checkIfHeader(r, () => {
            if(arg.contentLength === 0)
            { // Create file
                if(r)
                { // Resource exists => empty it
                    arg.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                        asyncWrite(arg, callback, r, targetSource);
                    })
                    return;
                }
                
                createResource(arg, callback, (r) => {
                    arg.setCode(HTTPCodes.OK)
                    callback(null, null);
                })
            }
            else
            { // Write to a file
                if(e)
                { // Resource not found
                    createResource(arg, callback, (r) => {
                        asyncWrite(arg, callback, r, targetSource);
                    })
                    return;
                }

                arg.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                    r.type((e, type) => process.nextTick(() => {
                        if(e)
                        {
                            callback(new HTTPError(HTTPCodes.InternalServerError, e), null);
                            return;
                        }
                        if(!type.isFile)
                        {
                            callback(new HTTPError(HTTPCodes.MethodNotAllowed, Errors.ExpectedAFileResourceType), null);
                            return;
                        }

                        asyncWrite(arg, callback, r, targetSource);
                    }))
                })
            }
        })
    })
}
*/
