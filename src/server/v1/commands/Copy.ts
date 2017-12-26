import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType, SimpleCallback } from '../../../resource/v1/IResource'
import { Workflow } from '../../../helper/Workflow'
import { Readable } from 'stream'
import { FSPath } from '../../../manager/v1/FSManager'

function copyAllProperties(source : IResource, destination : IResource, callback : SimpleCallback)
{
    source.getProperties((e, props) => {
        if(e)
        {
            callback(e);
            return;
        }

        new Workflow()
            .eachProperties(props, (name, value, cb) => {
                destination.setProperty(name, JSON.parse(JSON.stringify(value)), cb)
            })
            .error(callback)
            .done(() => callback(null));
    })
}

function copy(arg : MethodCallArgs, source : IResource, rDest : IResource, destination : FSPath, callback : SimpleCallback)
{
    // Error wrapper
    function _(error : Error, cb)
    {
        if(error)
            process.nextTick(() => callback(error));
        else
            process.nextTick(cb);
    }

    arg.requirePrivilege([ 'canGetType', 'canRead', 'canGetChildren', 'canGetProperties' ], source, () => {
        arg.requirePrivilege([ 'canAddChild' ], rDest, () => {
            source.type((e, type) => _(e, () => {
                const dest = rDest.fsManager.newResource(destination.toString(), destination.fileName(), type, rDest);

                arg.requirePrivilege([ 'canCreate', 'canSetProperty', 'canWrite' ], dest, () => {
                    dest.create((e) => _(e, () => {
                        arg.invokeEvent('create', dest);
                        
                        rDest.addChild(dest, (e) => _(e, () => {
                            arg.invokeEvent('addChild', rDest, dest);
                            
                            copyAllProperties(source, dest, (e) => _(e, () => {
                                if(!type.isFile)
                                {
                                    next();
                                    return;
                                }

                                source.size(true, (e, size) => {
                                    source.read(true, (e, rstream) => _(e, () => {
                                        dest.write(true, (e, wstream) => _(e, () => {
                                            rstream.on('end', () => {
                                                arg.invokeEvent('read', source);
                                                next();
                                            });
                                            wstream.on('finish', () => {
                                                arg.invokeEvent('write', dest);
                                            })
                                            rstream.pipe(wstream);
                                        }), size)
                                    }))
                                })

                                function next()
                                {
                                    if(!type.isDirectory)
                                    {
                                        arg.invokeEvent('copy', source, dest);
                                        callback(null);
                                        return;
                                    }

                                    source.getChildren((e, children) => _(e, () => {
                                        new Workflow()
                                            .each(children, (child, cb) => {
                                                child.webName((e, name) => process.nextTick(() => {
                                                    if(e)
                                                        cb(e);
                                                    else
                                                        copy(arg, child, dest, destination.getChildPath(name), cb);
                                                }))
                                            })
                                            .error(callback)
                                            .done(() => {
                                                arg.invokeEvent('copy', source, dest);
                                                callback(null);
                                            })
                                    }))
                                }
                            }))
                        }))
                    }))
                })
            }))
        })
    })
}

export function method(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.getResource((e, source) => {
            if(e)
            {
                arg.setCode(HTTPCodes.NotFound)
                callback();
                return;
            }

            arg.checkIfHeader(source, () => {
                const overwrite = arg.findHeader('overwrite') !== 'F';

                let destination : any = arg.findHeader('destination');
                if(!destination)
                {
                    arg.setCode(HTTPCodes.BadRequest);
                    callback();
                    return;
                }
                
                const startIndex = destination.indexOf('://');
                if(startIndex !== -1)
                {
                    destination = destination.substring(startIndex + '://'.length)
                    destination = destination.substring(destination.indexOf('/')) // Remove the hostname + port
                }
                destination = new FSPath(destination)

                arg.server.getResourceFromPath(arg, destination.getParent(), (e, rDest) => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }

                    arg.requirePrivilege([ 'canGetType' ], source, () => {
                        arg.requirePrivilege([ 'canGetChildren' ], rDest, () => {
                            source.type((e, type) => process.nextTick(() => {
                                if(e)
                                {
                                    arg.setCode(HTTPCodes.InternalServerError);
                                    callback();
                                    return;
                                }
                                
                                function done(overridded : boolean)
                                {
                                    copy(arg, source, rDest, destination, (e) => {
                                        if(e)
                                            arg.setCode(HTTPCodes.InternalServerError);
                                        else if(overridded)
                                            arg.setCode(HTTPCodes.NoContent);
                                        else
                                            arg.setCode(HTTPCodes.Created);
                                        callback();
                                    })
                                }

                                let nb = 0;
                                function go(error, destCollision : IResource)
                                {
                                    if(nb <= 0)
                                        return;
                                    if(error)
                                    {
                                        nb = -1;
                                        arg.setCode(HTTPCodes.InternalServerError);
                                        callback();
                                        return;
                                    }
                                    if(destCollision)
                                    {
                                        nb = -1;

                                        if(!overwrite)
                                        { // No overwrite allowed
                                            arg.setCode(HTTPCodes.InternalServerError);
                                            callback();
                                            return;
                                        }

                                        destCollision.type((e, destType) => process.nextTick(() => {
                                            if(e)
                                            {
                                                callback(e);
                                                return;
                                            }

                                            if(destType !== type)
                                            { // Type collision
                                                arg.setCode(HTTPCodes.InternalServerError);
                                                callback();
                                                return;
                                            }
                                            
                                            destCollision.delete((e) => process.nextTick(() => {
                                                if(e)
                                                {
                                                    callback(e);
                                                    return;
                                                }

                                                arg.invokeEvent('delete', destCollision);
                                                done(true);
                                            }))
                                        }))
                                        return;
                                    }

                                    --nb;
                                    if(nb === 0)
                                    {
                                        done(false);
                                    }
                                }

                                // Find child name collision
                                rDest.getChildren((e, children) => process.nextTick(() => {
                                    if(e)
                                    {
                                        go(e, null);
                                        return;
                                    }

                                    nb += children.length;
                                    if(nb === 0)
                                    {
                                        done(false);
                                        return;
                                    }
                                    children.forEach((child) => {
                                        child.webName((e, name) => process.nextTick(() => {
                                            go(e, name === destination.fileName() ? child : null);
                                        }))
                                    })
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
    return !!type;
};

export default method;
