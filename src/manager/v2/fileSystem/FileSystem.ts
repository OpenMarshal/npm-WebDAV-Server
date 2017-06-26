import { AvailableLocksInfo, CopyInfo, CreateInfo, CreationDateInfo, DeleteInfo, DisplayNameInfo, ETagInfo, IContextInfo, LastModifiedDateInfo, LockManagerInfo, MimeTypeInfo, MoveInfo, OpenReadStreamInfo, OpenWriteStreamInfo, PropertyManagerInfo, ReadDirInfo, RenameInfo, SizeInfo, TypeInfo, WebNameInfo } from './ContextInfo'
import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { BasicPrivilege } from '../../../user/v2/privilege/IPrivilegeManager'
import { XMLElement } from '../../../helper/XML'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import { ResourceType, SimpleCallback, Return2Callback, ReturnCallback, SubTree, OpenWriteStreamMode } from './CommonTypes'
import { ContextualFileSystem } from './ContextualFileSystem'
import { ILockManager } from './LockManager'
import { IPropertyManager } from './PropertyManager'
import { Resource } from './Resource'
import { StandardMethods } from './StandardMethods'
import { ISerializableFileSystem, FileSystemSerializer } from './Serialization'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export abstract class FileSystem implements ISerializableFileSystem
{
    private __serializer;

    constructor(serializer : FileSystemSerializer)
    {
        this.__serializer = serializer;
    }
    
    serializer() : FileSystemSerializer
    {
        return this.__serializer;
    }

    contextualize(ctx : RequestContext) : ContextualFileSystem
    {
        return new ContextualFileSystem(this, ctx);
    }

    resource(ctx : RequestContext, path : Path) : Resource
    {
        return new Resource(path, this, ctx);
    }
    
    fastExistCheckEx(ctx : RequestContext, path : Path, errorCallback : SimpleCallback, callback : () => void) : void
    {
        if(!this._fastExistCheck)
            return callback();
        
        this._fastExistCheck(ctx, path, (exists) => {
            if(!exists)
                errorCallback(Errors.ResourceNotFound);
            else
                callback();
        });
    }
    fastExistCheckExReverse(ctx : RequestContext, path : Path, errorCallback : SimpleCallback, callback : () => void) : void
    {
        if(!this._fastExistCheck)
            return callback();
        
        this._fastExistCheck(ctx, path, (exists) => {
            if(exists)
                errorCallback(Errors.ResourceAlreadyExists);
            else
                callback();
        });
    }
    protected fastExistCheck(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void
    {
        if(!this._fastExistCheck)
            return callback(true);
        
        this._fastExistCheck(ctx, path, (exists) => callback(!!exists));
    }
    protected _fastExistCheck?(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void

    create(ctx : RequestContext, path : Path, type : ResourceType, callback : SimpleCallback) : void
    create(ctx : RequestContext, path : Path, type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(ctx : RequestContext, path : Path, type : ResourceType, _createIntermediates : boolean | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const createIntermediates = _callback ? _createIntermediates as boolean : false;
        const callback = _callback ? _callback : _createIntermediates as SimpleCallback;

        if(!this._create)
            return callback(Errors.InvalidOperation);
        
        const go = () => {
            this._create(path, {
                context: ctx,
                type
            }, callback);
        }

        this.fastExistCheckExReverse(ctx, path, callback, () => {
            this.type(ctx, path.getParent(), (e, type) => {
                if(e === Errors.ResourceNotFound)
                {
                    if(!createIntermediates)
                        return callback(Errors.IntermediateResourceMissing);

                    this.getFullPath(ctx, path, (e, fullPath) => {
                        if(e)
                            return callback(e);
                        
                        fullPath = fullPath.getParent();
                        ctx.getResource(fullPath, (e, r) => {
                            if(e)
                                return callback(e);
                            
                            r.create(ResourceType.Directory, (e) => {
                                if(e && e !== Errors.ResourceAlreadyExists)
                                    return callback(e);
                                
                                go();
                            })
                        })
                    })
                    return;
                }
                if(e)
                    return callback(e);
                
                if(!type.isDirectory)
                    return callback(Errors.WrongParentTypeForCreation);

                go();
            })
        })
    }
    protected _create?(path : Path, ctx : CreateInfo, callback : SimpleCallback) : void

    etag(ctx : RequestContext, path : Path, callback : ReturnCallback<string>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._etag)
                return this.lastModifiedDate(ctx, path, (e, date) => {
                    if(e)
                        return callback(e);
                    callback(null, '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"');
                })

            this._etag(path, {
                context: ctx
            }, callback);
        })
    }
    protected _etag?(path : Path, ctx : ETagInfo, callback : ReturnCallback<string>) : void

    delete(ctx : RequestContext, path : Path, callback : SimpleCallback) : void
    delete(ctx : RequestContext, path : Path, depth : number, callback : SimpleCallback) : void
    delete(ctx : RequestContext, path : Path, _depth : number | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const depth = _callback ? _depth as number : -1;
        const callback = _callback ? _callback : _depth as SimpleCallback;

        if(!this._delete)
            return callback(Errors.InvalidOperation);

        this.fastExistCheckEx(ctx, path, callback, () => {
            this._delete(path, {
                context: ctx,
                depth
            }, callback);
        })
    }
    protected _delete?(path : Path, ctx : DeleteInfo, callback : SimpleCallback) : void
    
    openWriteStream(ctx : RequestContext, path : Path, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path, _mode : OpenWriteStreamMode | boolean | number | Return2Callback<Writable, boolean>, _targetSource ?: boolean | number | Return2Callback<Writable, boolean>, _estimatedSize ?: number | Return2Callback<Writable, boolean>, _callback ?: Return2Callback<Writable, boolean>) : void
    {
        let targetSource = true;
        for(const obj of [ _mode, _targetSource ])
            if(obj && obj.constructor === Boolean)
                targetSource = obj as boolean;

        let estimatedSize = -1;
        for(const obj of [ _mode, _targetSource, _estimatedSize ])
            if(obj && obj.constructor === Number)
                estimatedSize = obj as number;

        let callback;
        for(const obj of [ _mode, _targetSource, _estimatedSize, _callback ])
            if(obj && obj.constructor === Function)
                callback = obj as Return2Callback<Writable, boolean>;
        
        const mode = _mode && _mode.constructor === String ? _mode as OpenWriteStreamMode : 'mustExist';
        let created = false;
        
        if(!this._openWriteStream)
            return callback(Errors.InvalidOperation);
        
        const go = (callback : Return2Callback<Writable, boolean>) =>
        {
            this._openWriteStream(path, {
                context: ctx,
                estimatedSize,
                targetSource,
                mode
            }, (e, wStream) => callback(e, wStream, created));
        }

        const createAndGo = (intermediates : boolean) =>
        {
            this.create(ctx, path, ResourceType.File, intermediates, (e) => {
                if(e)
                    return callback(e);
                
                created = true;
                go(callback);
            })
        }

        switch(mode)
        {
            case 'mustExist':
                this.fastExistCheckEx(ctx, path, callback, () => go(callback));
                break;
            
            case 'mustCreateIntermediates':
            case 'mustCreate':
                createAndGo(mode === 'mustCreateIntermediates');
                break;
            
            case 'canCreateIntermediates':
            case 'canCreate':
                go((e, wStream) => {
                    if(e === Errors.ResourceNotFound)
                        createAndGo(mode === 'canCreateIntermediates');
                    else
                        callback(e, wStream);
                })
                break;
            
            default:
                callback(Errors.IllegalArguments);
                break;
        }
    }
    protected _openWriteStream?(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    
    openReadStream(ctx : RequestContext, path : Path, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path, targetSource : boolean, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path, targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path, _targetSource : boolean | number | ReturnCallback<Readable>, _estimatedSize ?: number | ReturnCallback<Readable>, _callback ?: ReturnCallback<Readable>) : void
    {
        const targetSource = _targetSource.constructor === Boolean ? _targetSource as boolean : true;
        const estimatedSize = _callback ? _estimatedSize as number : _estimatedSize ? _targetSource as number : -1;
        const callback = _callback ? _callback : _estimatedSize ? _estimatedSize as ReturnCallback<Readable> : _targetSource as ReturnCallback<Readable>;
        
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._openReadStream)
                return callback(Errors.InvalidOperation);

            this._openReadStream(path, {
                context: ctx,
                estimatedSize,
                targetSource
            }, callback);
        })
    }
    protected _openReadStream?(path : Path, ctx : OpenReadStreamInfo, callback : ReturnCallback<Readable>) : void

    move(ctx : RequestContext, pathFrom : Path, pathTo : Path, callback : ReturnCallback<boolean>) : void
    move(ctx : RequestContext, pathFrom : Path, pathTo : Path, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(ctx : RequestContext, pathFrom : Path, pathTo : Path, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const callback = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const overwrite = _callback ? _overwrite as boolean : false;

        const go = () =>
        {
            if(this._move)
            {
                this._move(pathFrom, pathTo, {
                    context: ctx,
                    overwrite
                }, callback);
                return;
            }

            StandardMethods.standardMove(ctx, pathFrom, this, pathTo, this, callback);
        }

        this.fastExistCheckEx(ctx, pathFrom, callback, () => {
            if(!overwrite)
                this.fastExistCheckExReverse(ctx, pathTo, callback, go);
            else
                go();
        })
    }
    protected _move?(pathFrom : Path, pathTo : Path, ctx : MoveInfo, callback : ReturnCallback<boolean>) : void

    copy(ctx : RequestContext, pathFrom : Path, pathTo : Path, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path, pathTo : Path, depth : number, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path, pathTo : Path, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path, pathTo : Path, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path, pathTo : Path, _overwrite : boolean | number | ReturnCallback<boolean>, _depth ?: number | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = _overwrite.constructor === Boolean ? _overwrite as boolean : false;
        const depth = _callback ? _depth as number : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite as number : -1;
        const callback = _callback ? _callback : _depth ? _depth as ReturnCallback<boolean> : _overwrite as ReturnCallback<boolean>;

        if(this._copy)
        {
            const go = () =>
            {
                this._copy(pathFrom, pathTo, {
                    context: ctx,
                    depth,
                    overwrite
                }, callback);
            }
            
            this.fastExistCheckEx(ctx, pathFrom, callback, () => {
                if(!overwrite)
                    this.fastExistCheckExReverse(ctx, pathTo, callback, go);
                else
                    go();
            })
        }
        else
            StandardMethods.standardCopy(ctx, pathFrom, this, pathTo, this, overwrite, depth, callback);
        
    }
    protected _copy?(pathFrom : Path, pathTo : Path, ctx : CopyInfo, callback : ReturnCallback<boolean>) : void

    rename(ctx : RequestContext, pathFrom : Path, newName : string, callback : ReturnCallback<boolean>) : void
    rename(ctx : RequestContext, pathFrom : Path, newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(ctx : RequestContext, pathFrom : Path, newName : string, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = _callback ? _overwrite as boolean : false;
        const callback = _callback ? _callback : _overwrite as ReturnCallback<boolean>;

        if(pathFrom.isRoot())
        {
            this.getFullPath(ctx, (e, fullPath) => {
                if(fullPath.isRoot())
                    return callback(Errors.InvalidOperation);
                
                const newPath = fullPath.getParent().getChildPath(newName);
                ctx.server.getFileSystem(newPath, (fs, _, subPath) => {
                    const go = (overwritten : boolean) =>
                    {
                        ctx.server.setFileSystem(newPath, this, (successed) => {
                            if(!successed)
                                return callback(Errors.InvalidOperation);
                            
                            ctx.server.removeFileSystem(fullPath, () => callback(null, overwritten));
                        })
                    }

                    if(!subPath.isRoot())
                        return go(false);

                    if(!overwrite)
                        return callback(Errors.ResourceAlreadyExists);
                    
                    ctx.server.removeFileSystem(newPath, () => {
                        go(true);
                    })
                })
            })
            return;
        }

        this.fastExistCheckEx(ctx, pathFrom, callback, () => {
        this.fastExistCheckExReverse(ctx, pathFrom.getParent().getChildPath(newName), callback, () => {
            if(this._rename)
            {
                this._rename(pathFrom, newName, {
                    context: ctx
                }, callback);
                return;
            }

            this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
        })
        })
    }
    protected _rename?(pathFrom : Path, newName : string, ctx : RenameInfo, callback : ReturnCallback<boolean>) : void

    mimeType(ctx : RequestContext, path : Path, callback : ReturnCallback<string>) : void
    mimeType(ctx : RequestContext, path : Path, targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(ctx : RequestContext, path : Path, _targetSource : boolean | ReturnCallback<string>, _callback ?: ReturnCallback<string>) : void
    {
        const targetSource = _callback ? _targetSource as boolean : true;
        const callback = _callback ? _callback : _targetSource as ReturnCallback<string>;

        this.fastExistCheckEx(ctx, path, callback, () => {
            if(this._mimeType)
            {
                this._mimeType(path, {
                    context: ctx,
                    targetSource
                }, callback);
                return;
            }

            StandardMethods.standardMimeType(ctx, this, path, targetSource, callback);
        })
    }
    protected _mimeType?(path : Path, ctx : MimeTypeInfo, callback : ReturnCallback<string>) : void

    size(ctx : RequestContext, path : Path, callback : ReturnCallback<number>) : void
    size(ctx : RequestContext, path : Path, targetSource : boolean, callback : ReturnCallback<number>) : void
    size(ctx : RequestContext, path : Path, _targetSource : boolean | ReturnCallback<number>, _callback ?: ReturnCallback<number>) : void
    {
        const targetSource = _callback ? _targetSource as boolean : true;
        const callback = _callback ? _callback : _targetSource as ReturnCallback<number>;

        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._size)
                return callback(null, 0);

            this._size(path, {
                context: ctx,
                targetSource
            }, callback);
        })
    }
    protected _size?(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void

    availableLocks(ctx : RequestContext, path : Path, callback : ReturnCallback<LockKind[]>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._availableLocks)
                return callback(null, [
                    new LockKind(LockScope.Exclusive, LockType.Write),
                    new LockKind(LockScope.Shared, LockType.Write)
                ]);

            this._availableLocks(path, {
                context: ctx
            }, callback);
        })
    }
    protected _availableLocks?(path : Path, ctx : AvailableLocksInfo, callback : ReturnCallback<LockKind[]>) : void

    lockManager(ctx : RequestContext, path : Path, callback : ReturnCallback<ILockManager>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            this._lockManager(path, {
                context: ctx
            }, callback);
        })
    }
    protected abstract _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void

    propertyManager(ctx : RequestContext, path : Path, callback : ReturnCallback<IPropertyManager>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            this._propertyManager(path, {
                context: ctx
            }, callback);
        })
    }
    protected abstract _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void

    readDir(ctx : RequestContext, path : Path, callback : ReturnCallback<string[]>) : void
    readDir(ctx : RequestContext, path : Path, retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(ctx : RequestContext, path : Path, _retrieveExternalFiles : boolean | ReturnCallback<string[]>, _callback ?: ReturnCallback<string[]>) : void
    {
        const retrieveExternalFiles = _callback ? _retrieveExternalFiles as boolean : false;
        const callback = _callback ? _callback : _retrieveExternalFiles as ReturnCallback<string[]>;

        this.fastExistCheckEx(ctx, path, callback, () => {
            const next = (base : string[]) => {
                if(!this._readDir)
                    return callback(null, base);
                
                this._readDir(path, {
                    context: ctx
                }, (e, paths) => {
                    if(e)
                        return callback(e);
                    
                    if(paths.length === 0)
                        return callback(null, base);
                    
                    if(paths[0].constructor === String)
                        base = base.concat(paths as string[]);
                    else
                        base = base.concat((paths as Path[]).map((p) => p.fileName()));
                    
                    callback(null, base);
                });
            }

            if(!retrieveExternalFiles)
                return next([]);

            this.getFullPath(ctx, (e, thisFullPath) => {
                if(e)
                    return callback(e);
                
                ctx.server.getChildFileSystems(thisFullPath.getChildPath(path), (fss) => {
                    next(fss.map((f) => f.path.fileName()));
                })
            })
        })
    }
    protected _readDir?(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void

    creationDate(ctx : RequestContext, path : Path, callback : ReturnCallback<number>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._creationDate && !this._lastModifiedDate)
                return callback(null, 0);
            if(!this._creationDate)
                return this.lastModifiedDate(ctx, path, callback);
            
            this._creationDate(path, {
                context: ctx
            }, callback);
        })
    }
    protected _creationDate?(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void

    lastModifiedDate(ctx : RequestContext, path : Path, callback : ReturnCallback<number>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._creationDate && !this._lastModifiedDate)
                return callback(null, 0);
            if(!this._lastModifiedDate)
                return this.creationDate(ctx, path, callback);
            
            this._lastModifiedDate(path, {
                context: ctx
            }, callback);
        })
    }
    protected _lastModifiedDate?(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void

    webName(ctx : RequestContext, path : Path, callback : ReturnCallback<string>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(path.isRoot())
                this.getFullPath(ctx, (e, path) => callback(e, e ? null : path.fileName()));
            else
                callback(null, path.fileName());
        })
    }

    displayName(ctx : RequestContext, path : Path, callback : ReturnCallback<string>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            if(!this._displayName)
                return this.webName(ctx, path, callback);
            
            this._displayName(path, {
                context: ctx
            }, callback);
        })
    }
    protected _displayName?(path : Path, ctx : DisplayNameInfo, callback : ReturnCallback<string>) : void

    type(ctx : RequestContext, path : Path, callback : ReturnCallback<ResourceType>) : void
    {
        this.fastExistCheckEx(ctx, path, callback, () => {
            this._type(path, {
                context: ctx
            }, callback);
        })
    }
    protected abstract _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void

    addSubTree(ctx : RequestContext, subTree : SubTree, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, rootPath : Path, subTree : SubTree, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, rootPath : Path, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, _rootPath : Path | SubTree | ResourceType | SimpleCallback, _tree : SubTree | ResourceType | SimpleCallback, _callback ?: SimpleCallback)
    {
        const callback = _callback ? _callback : _tree as SimpleCallback;
        const tree = _callback ? _tree as SubTree | ResourceType : _rootPath as SubTree | ResourceType;
        const rootPath = _callback ? _rootPath as Path : new Path('/');

        if(tree.constructor === ResourceType)
        {
            this.create(ctx, rootPath, tree as ResourceType, callback);
        }
        else
        {
            new Workflow()
                .each(Object.keys(tree), (name, cb) => {
                    const value = tree[name];
                    if(value.constructor === ResourceType)
                        this.addSubTree(ctx, rootPath.getChildPath(name), value, cb)
                    else
                        this.addSubTree(ctx, rootPath.getChildPath(name), ResourceType.Directory, (e) => {
                            if(e)
                                return cb(e);
                                
                            this.addSubTree(ctx, rootPath.getChildPath(name), value, cb);
                        })
                })
                .error(callback)
                .done(() => callback());
        }
    }

    listDeepLocks(ctx : RequestContext, startPath : Path, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(ctx : RequestContext, startPath : Path, depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(ctx : RequestContext, startPath : Path, _depth : number | ReturnCallback<{ [path : string] : Lock[] }>, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        const depth = _callback ? _depth as number : 0;
        const callback = _callback ? _callback : _depth as ReturnCallback<{ [path : string] : Lock[] }>;

        this.lockManager(ctx, startPath, (e, lm) => {
            if(e)
                return callback(e);
            
            lm.getLocks((e, locks) => {
                if(e)
                    return callback(e);
                
                if(depth != -1)
                    locks = locks.filter((f) => f.depth === -1 || f.depth >= depth);
                
                const go = (fs : FileSystem, parentPath : Path) =>
                {
                    const destDepth = depth === -1 ? -1 : depth + 1;
                    fs.listDeepLocks(ctx, parentPath, destDepth, (e, pLocks) => {
                        if(e)
                            return callback(e);
                        
                        if(locks && locks.length > 0)
                            pLocks[startPath.toString()] = locks;
                        callback(null, pLocks);
                    })
                }

                if(!startPath.isRoot())
                    return go(this, startPath.getParent());
                
                this.getFullPath(ctx, (e, fsPath) => {
                    if(e)
                        return callback(e);
                    
                    if(fsPath.isRoot())
                    {
                        const result = {};
                        if(locks && locks.length > 0)
                            result[startPath.toString()] = locks;
                        return callback(null, result);
                    }
                    
                    ctx.server.getFileSystem(fsPath.getParent(), (fs, _, subPath) => {
                        go(fs, subPath);
                    })
                })
            })
        })
    }

    getFullPath(ctx : RequestContext, callback : ReturnCallback<Path>)
    getFullPath(ctx : RequestContext, path : Path, callback : ReturnCallback<Path>)
    getFullPath(ctx : RequestContext, _path : Path | ReturnCallback<Path>, _callback ?: ReturnCallback<Path>)
    {
        const path = _callback ? _path as Path : undefined;
        const callback = _callback ? _callback : _path as ReturnCallback<Path>;
        
        ctx.server.getFileSystemPath(this, (fsPath) => {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        })
    }

    checkPrivilege(ctx : RequestContext, path : Path, privilege : BasicPrivilege, callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path, privileges : BasicPrivilege[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path, privilege : string, callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path, privileges : string[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path, privileges : string | string[], callback : ReturnCallback<boolean>)
    {
        if(privileges.constructor === String)
            privileges = [ privileges as string ];
        
        const resource = this.resource(ctx, path);
        new Workflow()
            .each(privileges as string[], (privilege, cb) => {
                if(!privilege)
                    return cb(null, true);
                
                const method = ctx.server.options.privilegeManager[privilege];
                if(!method)
                    return cb(null, true);
                
                method(ctx, resource, cb);
            })
            .error((e) => callback(e, false))
            .done((successes) => callback(null, successes.every((s) => !!s)));
    }

    serialize(callback : ReturnCallback<any>) : void
    {
        this.serializer().serialize(this, callback);
    }
}
