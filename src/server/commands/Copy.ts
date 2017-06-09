import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType, SimpleCallback } from '../../resource/IResource'
import { Readable } from 'stream'
import { FSPath } from '../../manager/FSManager'

function copyAllProperties(source : IResource, destination : IResource, callback : SimpleCallback)
{
    source.getProperties((e, props) => {
        if(e)
        {
            callback(e);
            return;
        }

        let nb = Object.keys(props).length;
        function go(error)
        {
            if(nb <= 0)
                return;
            if(error)
            {
                nb = -1;
                callback(error);
                return;
            }

            --nb;
            if(nb === 0)
                callback(null);
        }

        if(nb === 0)
        {
            callback(null);
            return;
        }

        for(const name in props)
        {
            if(nb <= 0)
                break;
            
            destination.setProperty(name, JSON.parse(JSON.stringify(props[name])), go)
        }
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
                        rDest.addChild(dest, (e) => _(e, () => {
                            copyAllProperties(source, dest, (e) => _(e, () => {
                                if(!type.isFile)
                                {
                                    next();
                                    return;
                                }

                                source.read(true, (e, rstream) => _(e, () => {
                                    dest.write(true, (e, wstream) => _(e, () => {
                                        rstream.on('end', next);
                                        rstream.pipe(wstream);
                                    }))
                                }))

                                function next()
                                {
                                    if(!type.isDirectory)
                                    {
                                        callback(null);
                                        return;
                                    }

                                    source.getChildren((e, children) => _(e, () => {
                                        let nb = children.length;
                                        function done(error)
                                        {
                                            if(nb <= 0)
                                                return;
                                            if(error)
                                            {
                                                nb = -1;
                                                callback(e);
                                                return;
                                            }

                                            --nb;
                                            if(nb === 0)
                                                callback(null);
                                        }

                                        if(nb === 0)
                                        {
                                            callback(null);
                                            return;
                                        }

                                        children.forEach((child) => {
                                            child.webName((e, name) => process.nextTick(() => {
                                                if(e)
                                                    done(e);
                                                else
                                                    copy(arg, child, dest, destination.getChildPath(name), done);
                                            }))
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

export default function(arg : MethodCallArgs, callback)
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
                
                destination = destination.substring(destination.indexOf('://') + '://'.length)
                destination = destination.substring(destination.indexOf('/'))
                destination = new FSPath(destination)

                arg.server.getResourceFromPath(destination.getParent(), (e, rDest) => {
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
