import { ReturnCallback, SimpleCallback } from './CommonTypes'
import { RequestContext } from '../../../server/v2/RequestContext'
import { FileSystem } from './FileSystem'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Path } from '../Path'
import * as mimeTypes from 'mime-types'

export abstract class StandardMethods
{
    public static standardMove(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, callback : ReturnCallback<boolean>) : void
    public static standardMove(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    public static standardMove(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const callback = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const overwrite = _callback ? _overwrite as boolean : false;

        const go = (fullPathFrom ?: Path) =>
        {
            StandardMethods.standardCopy(ctx, subPathFrom, fsFrom, subPathTo, fsTo, overwrite, -1, (e, overwritten) => {
                if(e)
                    return callback(e, overwritten);
                
                if(fullPathFrom)
                { // subPathFrom.isRoot() === true
                    ctx.server.removeFileSystem(fullPathFrom, (nb) => {
                        callback(null, overwritten);
                    })
                    return;
                }

                fsFrom.delete(ctx, subPathFrom, -1, (e) => callback(e, overwritten));
            })
        }
        
        if(subPathFrom.isRoot())
        {
            fsFrom.getFullPath(ctx, (e, fullPathFrom) => {
                go(fullPathFrom);
            })
        }
        else
            go();
    }



    public static standardCopy(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, callback : ReturnCallback<boolean>) : void
    public static standardCopy(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, depth : number, callback : ReturnCallback<boolean>) : void
    public static standardCopy(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    public static standardCopy(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    public static standardCopy(ctx : RequestContext, subPathFrom : Path, fsFrom : FileSystem, subPathTo : Path, fsTo : FileSystem, _overwrite : boolean | number | ReturnCallback<boolean>, _depth ?: number | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = _overwrite.constructor === Boolean ? _overwrite as boolean : false;
        const depth = _callback ? _depth as number : (!_depth ? -1 : (_overwrite.constructor === Number ? _overwrite as number : -1));
        const callback = _callback ? _callback : (_depth ? _depth as ReturnCallback<boolean> : _overwrite as ReturnCallback<boolean>);

        if(subPathFrom.isRoot())
        {
            fsTo.getFullPath(ctx, subPathTo, (e, fullPathTo) => {
                if(e)
                    return callback(e);
                
                let overwritten = false;
                ctx.server.getResource(ctx, fullPathTo, (e, r) => {
                    if(e)
                        return callback(e);
                    
                    r.type((e, type) => {
                        if(!e)
                            overwritten = true;
                
                        ctx.server.setFileSystem(fullPathTo, fsFrom, (success) => {
                            callback(null, overwritten);
                        })
                    })
                })
            })

            return;
        }

        const go = () =>
        {
            const copyProperties = (callback : SimpleCallback) =>
            {
                fsFrom.propertyManager(ctx, subPathFrom, (e, pmFrom) => {
                    if(e)
                        return callback(e);
                    
                    fsTo.propertyManager(ctx, subPathTo, (e, pmTo) => {
                        if(e)
                            return callback(e);

                        pmFrom.getProperties((e, props) => {
                            if(e)
                                return callback(e);

                            new Workflow()
                                .each(Object.keys(props), (name, cb) => {
                                    const prop = props[name];
                                    pmTo.setProperty(name, prop.value, prop.attributes, cb)
                                })
                                .error(callback)
                                .done((_) => callback())
                        })
                    })
                })
            }

            const reverse1 = (e : Error) => {
                fsTo.delete(ctx, subPathTo, () => callback(e));
            };

            const copyContent = (callback : SimpleCallback) =>
            {
                fsFrom.size(ctx, subPathFrom, true, (e, size) => {
                    fsFrom.openReadStream(ctx, subPathFrom, true, (e, rStream) => {
                        if(e)
                            return reverse1(e);
                        
                        fsTo.openWriteStream(ctx, subPathTo, true, size, (e, wStream) => {
                            if(e)
                                return reverse1(e);
                            
                            let _callback = (e) =>
                            {
                                _callback = () => {};
                                callback(e);
                            }

                            rStream.pipe(wStream);
                            rStream.on('error', _callback)
                            wStream.on('error', _callback)
                            wStream.on('finish', () => {
                                _callback(null);
                            })
                        })
                    })
                });
            }

            const copyChildren = (callback : SimpleCallback) =>
            {
                fsFrom.readDir(ctx, subPathFrom, false, (e, files) => {
                    if(e)
                        return callback(e);
                    
                    const subDepth = depth === -1 ? -1 : Math.max(0, depth - 1);
                    
                    new Workflow()
                        .each(files, (file, cb) => StandardMethods.standardCopy(ctx, subPathFrom.getChildPath(file), fsFrom, subPathTo.getChildPath(file), fsTo, overwrite, subDepth, cb))
                        .error(callback)
                        .done((_) => callback());
                })
            }

            fsFrom.type(ctx, subPathFrom, (e, type) => {
                if(e)
                    return callback(e);
                
                let overwritten = false;

                const startCopy = () =>
                {
                    const fns = [ copyProperties ];

                    if(type.isDirectory && depth !== 0)
                        fns.push(copyChildren);
                    if(type.isFile)
                        fns.push(copyContent);
                    
                    new Workflow()
                        .each(fns, (fn, cb) => fn(cb))
                        .error((e) => callback(e, overwritten))
                        .done(() => callback(null, overwritten));
                }

                fsTo.create(ctx, subPathTo, type, (e) => {
                    if(e === Errors.ResourceAlreadyExists && overwrite)
                    {
                        fsTo.delete(ctx, subPathTo, -1, (e) => {
                            if(e)
                                return callback(e);
                            overwritten = true;

                            fsTo.create(ctx, subPathTo, type, (e) => {
                                if(e)
                                    return callback(e);
                                startCopy();
                            })
                        })
                        return;
                    }
                    else if(e)
                        return callback(e);
                    
                    startCopy();
                })
            })
        }
        
        fsFrom.fastExistCheckEx(ctx, subPathFrom, callback, () => {
            if(!overwrite)
                fsTo.fastExistCheckExReverse(ctx, subPathTo, callback, go);
            else
                go();
        })
    }

    public static standardMimeType(ctx : RequestContext, fs : FileSystem, path : Path, targetSource : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(ctx : RequestContext, fs : FileSystem, path : Path, targetSource : boolean, useWebName : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(ctx : RequestContext, fs : FileSystem, path : Path, targetSource : boolean, defaultMimeType : string, callback : ReturnCallback<string>)
    public static standardMimeType(ctx : RequestContext, fs : FileSystem, path : Path, targetSource : boolean, defaultMimeType : string, useWebName : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(ctx : RequestContext, fs : FileSystem, path : Path, targetSource : boolean, _defaultMimeType : boolean | string | ReturnCallback<string>, _useWebName ?: boolean | ReturnCallback<string>, _callback ?: ReturnCallback<string>)
    {
        let callback;
        let useWebName = false;
        let defaultMimeType = 'application/octet-stream';

        if(_defaultMimeType.constructor === Function)
        {
            callback = _defaultMimeType as ReturnCallback<string>;
        }
        else if(_defaultMimeType.constructor === Boolean)
        {
            callback = _useWebName as ReturnCallback<string>;
            if(_defaultMimeType !== undefined && _defaultMimeType !== null)
                useWebName = _defaultMimeType as boolean;
        }
        else
        {
            callback = _callback as ReturnCallback<string>;
            if(_useWebName !== undefined && _useWebName !== null)
                useWebName = _useWebName as boolean;
            if(_defaultMimeType !== undefined && _defaultMimeType !== null)
                defaultMimeType = _defaultMimeType as string;
        }

        fs.type(ctx, path, (e, type) => {
            if(e)
                return callback(e, null);
            
            if(type.isFile)
            {
                const fn = useWebName ? fs.webName : fs.displayName;
                fn.bind(fs)(ctx, path, (e, name) => {
                    if(e)
                        callback(e, null);
                    else
                    {
                        const mt = mimeTypes.contentType(name);
                        callback(null, mt ? mt as string : defaultMimeType);
                    }
                })
            }
            else
                callback(Errors.NoMimeTypeForAFolder, null);
        })
    }
}
