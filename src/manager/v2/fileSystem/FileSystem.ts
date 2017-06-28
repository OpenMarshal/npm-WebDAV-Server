import { PrivilegeManagerInfo, AvailableLocksInfo, CopyInfo, CreateInfo, CreationDateInfo, DeleteInfo, DisplayNameInfo, ETagInfo, IContextInfo, LastModifiedDateInfo, LockManagerInfo, MimeTypeInfo, MoveInfo, OpenReadStreamInfo, OpenWriteStreamInfo, PropertyManagerInfo, ReadDirInfo, RenameInfo, SizeInfo, TypeInfo, WebNameInfo } from './ContextInfo'
import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { BasicPrivilege, PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager'
import { XMLElement } from '../../../helper/XML'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import { ResourceType, SimpleCallback, Return2Callback, ReturnCallback, SubTree, OpenWriteStreamMode, ResourcePropertyValue } from './CommonTypes'
import { ContextualFileSystem } from './ContextualFileSystem'
import { ILockManager } from './LockManager'
import { IPropertyManager, PropertyBag } from './PropertyManager'
import { Resource } from './Resource'
import { StandardMethods } from './StandardMethods'
import { ISerializableFileSystem, FileSystemSerializer } from './Serialization'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

class BufferedIsLocked
{
    _isLocked : boolean;

    constructor(public fs : FileSystem, public ctx : RequestContext, public path : Path)
    {
        this._isLocked = null;
    }

    isLocked(callback : ReturnCallback<boolean>)
    {
        if(this._isLocked !== null)
            return callback(null, this._isLocked);
        
        this.fs.isLocked(this.ctx, this.path, (e, locked) => {
            if(e)
                return callback(e);
            
            this._isLocked = locked;
            callback(null, locked);
        })
    }
}

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
    
    fastExistCheckEx(ctx : RequestContext, _path : Path | string, errorCallback : SimpleCallback, callback : () => void) : void
    {
        if(!this._fastExistCheck)
            return callback();
        
        const path = new Path(_path);
        this._fastExistCheck(ctx, path, (exists) => {
            if(!exists)
                errorCallback(Errors.ResourceNotFound);
            else
                callback();
        });
    }
    fastExistCheckExReverse(ctx : RequestContext, _path : Path | string, errorCallback : SimpleCallback, callback : () => void) : void
    {
        if(!this._fastExistCheck)
            return callback();
        
        const path = new Path(_path);
        this._fastExistCheck(ctx, path, (exists) => {
            if(exists)
                errorCallback(Errors.ResourceAlreadyExists);
            else
                callback();
        });
    }
    protected fastExistCheck(ctx : RequestContext, _path : Path | string, callback : (exists : boolean) => void) : void
    {
        if(!this._fastExistCheck)
            return callback(true);
        
        const path = new Path(_path);
        this._fastExistCheck(ctx, path, (exists) => callback(!!exists));
    }
    protected _fastExistCheck?(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void

    create(ctx : RequestContext, path : Path | string, type : ResourceType, callback : SimpleCallback) : void
    create(ctx : RequestContext, path : Path | string, type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(ctx : RequestContext, _path : Path | string, type : ResourceType, _createIntermediates : boolean | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const createIntermediates = _callback ? _createIntermediates as boolean : false;
        const callback = _callback ? _callback : _createIntermediates as SimpleCallback;
        const path = new Path(_path);

        if(!this._create)
            return callback(Errors.InvalidOperation);
        
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, () => {
            const go = () => {
                this._create(path, {
                    context: ctx,
                    type
                }, callback);
            }

            this.isLocked(ctx, path, (e, locked) => {
                if(e || locked)
                    return callback(locked ? Errors.Locked : e);
                
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
            })
        })
    }
    protected _create?(path : Path, ctx : CreateInfo, callback : SimpleCallback) : void

    etag(ctx : RequestContext, _path : Path | string, callback : ReturnCallback<string>) : void
    {
        const path = new Path(_path);

        issuePrivilegeCheck(this, ctx, path, 'canReadProperties', callback, () => {
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
        })
    }
    protected _etag?(path : Path, ctx : ETagInfo, callback : ReturnCallback<string>) : void

    delete(ctx : RequestContext, path : Path | string, callback : SimpleCallback) : void
    delete(ctx : RequestContext, path : Path | string, depth : number, callback : SimpleCallback) : void
    delete(ctx : RequestContext, _path : Path | string, _depth : number | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const depth = _callback ? _depth as number : -1;
        const callback = _callback ? _callback : _depth as SimpleCallback;
        const path = new Path(_path);

        if(!this._delete)
            return callback(Errors.InvalidOperation);

        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, () => {
            this.isLocked(ctx, path, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                this.fastExistCheckEx(ctx, path, callback, () => {
                    this._delete(path, {
                        context: ctx,
                        depth
                    }, callback);
                })
            })
        })
    }
    protected _delete?(path : Path, ctx : DeleteInfo, callback : SimpleCallback) : void
    
    openWriteStream(ctx : RequestContext, path : Path | string, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, _path : Path | string, _mode : OpenWriteStreamMode | boolean | number | Return2Callback<Writable, boolean>, _targetSource ?: boolean | number | Return2Callback<Writable, boolean>, _estimatedSize ?: number | Return2Callback<Writable, boolean>, _callback ?: Return2Callback<Writable, boolean>) : void
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
        const path = new Path(_path);
        let created = false;
        
        if(!this._openWriteStream)
            return callback(Errors.InvalidOperation);
        
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canWriteContentSource' : 'canWriteContentTranslated', callback, () => {
            this.isLocked(ctx, path, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
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
            })
        })
    }
    protected _openWriteStream?(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    
    openReadStream(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path | string, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, _path : Path | string, _targetSource : boolean | number | ReturnCallback<Readable>, _estimatedSize ?: number | ReturnCallback<Readable>, _callback ?: ReturnCallback<Readable>) : void
    {
        const targetSource = _targetSource.constructor === Boolean ? _targetSource as boolean : true;
        const estimatedSize = _callback ? _estimatedSize as number : _estimatedSize ? _targetSource as number : -1;
        const callback = _callback ? _callback : _estimatedSize ? _estimatedSize as ReturnCallback<Readable> : _targetSource as ReturnCallback<Readable>;
        const path = new Path(_path);
        
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, () => {
            this.fastExistCheckEx(ctx, path, callback, () => {
                if(!this._openReadStream)
                    return callback(Errors.InvalidOperation);

                this._openReadStream(path, {
                    context: ctx,
                    estimatedSize,
                    targetSource
                }, callback);
            })
        })
    }
    protected _openReadStream?(path : Path, ctx : OpenReadStreamInfo, callback : ReturnCallback<Readable>) : void

    move(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    move(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(ctx : RequestContext, _pathFrom : Path | string, _pathTo : Path | string, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const callback = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const overwrite = _callback ? _overwrite as boolean : false;
        const pathFrom = new Path(_pathFrom);
        const pathTo = new Path(_pathTo);

        issuePrivilegeCheck(this, ctx, pathFrom, 'canRead', callback, () => {
        issuePrivilegeCheck(this, ctx, pathTo, 'canWrite', callback, () => {
            this.isLocked(ctx, pathFrom, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                    this.isLocked(ctx, pathTo, (e, isLocked) => {
                        if(e || isLocked)
                            return callback(e ? e : Errors.Locked);
                        
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
                })
            })
        })
        })
    }
    protected _move?(pathFrom : Path, pathTo : Path, ctx : MoveInfo, callback : ReturnCallback<boolean>) : void

    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, depth : number, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, _pathFrom : Path | string, _pathTo : Path | string, _overwrite : boolean | number | ReturnCallback<boolean>, _depth ?: number | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = _overwrite.constructor === Boolean ? _overwrite as boolean : false;
        const depth = _callback ? _depth as number : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite as number : -1;
        const callback = _callback ? _callback : _depth ? _depth as ReturnCallback<boolean> : _overwrite as ReturnCallback<boolean>;
        const pathFrom = new Path(_pathFrom);
        const pathTo = new Path(_pathTo);

        issuePrivilegeCheck(this, ctx, pathFrom, 'canRead', callback, () => {
        issuePrivilegeCheck(this, ctx, pathTo, 'canWrite', callback, () => {
            this.isLocked(ctx, pathTo, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
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
            })
        })
        })
    }
    protected _copy?(pathFrom : Path, pathTo : Path, ctx : CopyInfo, callback : ReturnCallback<boolean>) : void

    rename(ctx : RequestContext, pathFrom : Path | string, newName : string, callback : ReturnCallback<boolean>) : void
    rename(ctx : RequestContext, pathFrom : Path | string, newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(ctx : RequestContext, _pathFrom : Path | string, newName : string, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = _callback ? _overwrite as boolean : false;
        const callback = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const pathFrom = new Path(_pathFrom);

        issuePrivilegeCheck(this, ctx, pathFrom, [ 'canRead', 'canWrite' ], callback, () => {
            this.isLocked(ctx, pathFrom, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                if(pathFrom.isRoot())
                {
                    this.getFullPath(ctx, (e, fullPath) => {
                        if(fullPath.isRoot())
                            return callback(Errors.InvalidOperation);
                        
                        const newPath = fullPath.getParent().getChildPath(newName);
                        issuePrivilegeCheck(this, ctx, newPath, 'canWrite', callback, () => {
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
                    })
                    return;
                }

                this.fastExistCheckEx(ctx, pathFrom, callback, () => {
                this.fastExistCheckExReverse(ctx, pathFrom.getParent().getChildPath(newName), callback, () => {
                    const newPath = pathFrom.getParent().getChildPath(newName);
                    this.isLocked(ctx, newPath, (e, isLocked) => {
                        if(e || isLocked)
                            return callback(e ? e : Errors.Locked);
                        
                        issuePrivilegeCheck(this, ctx, newPath, 'canWrite', callback, () => {
                            if(this._rename)
                            {
                                this._rename(pathFrom, newName, {
                                    context: ctx,
                                    destinationPath: newPath
                                }, callback);
                                return;
                            }
                        })

                        this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
                    })
                })
                })
            })
        })
    }
    protected _rename?(pathFrom : Path, newName : string, ctx : RenameInfo, callback : ReturnCallback<boolean>) : void

    mimeType(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string>) : void
    mimeType(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(ctx : RequestContext, _path : Path | string, _targetSource : boolean | ReturnCallback<string>, _callback ?: ReturnCallback<string>) : void
    {
        const targetSource = _callback ? _targetSource as boolean : true;
        const callback = _callback ? _callback : _targetSource as ReturnCallback<string>;
        const path = new Path(_path);

        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, () => {
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
        })
    }
    protected _mimeType?(path : Path, ctx : MimeTypeInfo, callback : ReturnCallback<string>) : void

    size(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    size(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<number>) : void
    size(ctx : RequestContext, path : Path | string, _targetSource : boolean | ReturnCallback<number>, _callback ?: ReturnCallback<number>) : void
    {
        const targetSource = _callback ? _targetSource as boolean : true;
        const callback = _callback ? _callback : _targetSource as ReturnCallback<number>;
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._size)
                    return callback(null, 0);

                this._size(pPath, {
                    context: ctx,
                    targetSource
                }, callback);
            })
        })
    }
    protected _size?(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void

    availableLocks(ctx : RequestContext, path : Path | string, callback : ReturnCallback<LockKind[]>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canWriteLocks', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._availableLocks)
                    return callback(null, [
                        new LockKind(LockScope.Exclusive, LockType.Write),
                        new LockKind(LockScope.Shared, LockType.Write)
                    ]);

                this._availableLocks(pPath, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected _availableLocks?(path : Path, ctx : AvailableLocksInfo, callback : ReturnCallback<LockKind[]>) : void

    lockManager(ctx : RequestContext, path : Path | string, callback : ReturnCallback<ILockManager>) : void
    {
        const pPath = new Path(path);

        this.fastExistCheckEx(ctx, pPath, callback, () => {
            this._lockManager(pPath, {
                context: ctx
            }, (e, lm) => {
                if(e)
                    return callback(e);
                
                const buffIsLocked = new BufferedIsLocked(this, ctx, pPath);
                const fs = this;
                
                callback(null, {
                    getLocks(callback : ReturnCallback<Lock[]>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, () => {
                            lm.getLocks(callback);
                        })
                    },
                    setLock(lock : Lock, callback : SimpleCallback) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.setLock(lock, callback);
                            })
                        })
                    },
                    removeLock(uuid : string, callback : ReturnCallback<boolean>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.removeLock(uuid, callback);
                            })
                        })
                    },
                    getLock(uuid : string, callback : ReturnCallback<Lock>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, () => {
                            lm.getLock(uuid, callback);
                        })
                    },
                    refresh(uuid : string, timeout : number, callback : ReturnCallback<Lock>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.refresh(uuid, timeout, callback);
                            })
                        })
                    }
                })
            });
        })
    }
    protected abstract _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void

    propertyManager(ctx : RequestContext, path : Path | string, callback : ReturnCallback<IPropertyManager>) : void
    {
        const pPath = new Path(path);

        this.fastExistCheckEx(ctx, pPath, callback, () => {
            this._propertyManager(pPath, {
                context: ctx
            }, (e, pm) => {
                if(e)
                    return callback(e);
                
                const buffIsLocked = new BufferedIsLocked(this, ctx, pPath);
                const fs = this;
                
                callback(null, {
                    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                pm.setProperty(name, value, callback);
                            })
                        })
                    },
                    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, () => {
                            pm.getProperty(name, callback);
                        })
                    },
                    removeProperty(name : string, callback : SimpleCallback) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                pm.removeProperty(name, callback);
                            })
                        })
                    },
                    getProperties(callback : ReturnCallback<PropertyBag>, byCopy ?: boolean) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, () => {
                            pm.getProperties(callback, byCopy);
                        })
                    }
                })
            });
        })
    }
    protected abstract _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void

    readDir(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string[]>) : void
    readDir(ctx : RequestContext, path : Path | string, retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(ctx : RequestContext, path : Path | string, _retrieveExternalFiles : boolean | ReturnCallback<string[]>, _callback ?: ReturnCallback<string[]>) : void
    {
        const retrieveExternalFiles = _callback ? _retrieveExternalFiles as boolean : false;
        const __callback = _callback ? _callback : _retrieveExternalFiles as ReturnCallback<string[]>;
        const pPath = new Path(path);
        const callback = (e ?: Error, data ?: Path[]) => {
            if(e)
                return _callback(e);
            if(!data)
                data = [];
            
            this.getFullPath(ctx, (e, fsFullPath) => {
                new Workflow()
                    .each(data, (path, cb) => {
                        this.checkPrivilege(ctx, path, 'canReadProperties', (e, can) => {
                            if(e)
                                cb(e);
                            else
                                cb(null, can ? path : null);
                        });
                    })
                    .error((e) => __callback(e))
                    .done(() => __callback(null, data.filter((p) => !!p).map((p) => p.fileName())));
            })
        }

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                const next = (base : Path[]) => {
                    if(!this._readDir)
                        return callback(null, base);
                    
                    this._readDir(pPath, {
                        context: ctx
                    }, (e, paths) => {
                        if(e)
                            return callback(e);
                        
                        if(paths.length === 0)
                            return callback(null, base);
                        
                        if(paths[0].constructor === String)
                            base = base.concat((paths as string[]).map((s) => pPath.getChildPath(s)));
                        else
                            base = base.concat(paths as Path[]);
                        
                        callback(null, base);
                    });
                }

                if(!retrieveExternalFiles)
                    return next([]);

                this.getFullPath(ctx, (e, thisFullPath) => {
                    if(e)
                        return callback(e);
                    
                    ctx.server.getChildFileSystems(thisFullPath.getChildPath(pPath), (fss) => {
                        this.localize(ctx, fss.map((f) => f.path), (e, paths) => {
                            if(e)
                                return callback(e);
                            next(paths);
                        })
                    })
                })
            })
        })
    }
    protected _readDir?(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void

    creationDate(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._creationDate && !this._lastModifiedDate)
                    return callback(null, 0);
                if(!this._creationDate)
                    return this.lastModifiedDate(ctx, pPath, callback);
                
                this._creationDate(pPath, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected _creationDate?(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void

    lastModifiedDate(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._creationDate && !this._lastModifiedDate)
                    return callback(null, 0);
                if(!this._lastModifiedDate)
                    return this.creationDate(ctx, pPath, callback);
                
                this._lastModifiedDate(pPath, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected _lastModifiedDate?(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void

    webName(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(pPath.isRoot())
                    this.getFullPath(ctx, (e, pPath) => callback(e, e ? null : pPath.fileName()));
                else
                    callback(null, pPath.fileName());
            })
        })
    }

    displayName(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._displayName)
                    return this.webName(ctx, pPath, callback);
                
                this._displayName(pPath, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected _displayName?(path : Path, ctx : DisplayNameInfo, callback : ReturnCallback<string>) : void

    type(ctx : RequestContext, path : Path | string, callback : ReturnCallback<ResourceType>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                this._type(pPath, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected abstract _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void

    addSubTree(ctx : RequestContext, subTree : SubTree, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, rootPath : Path | string, subTree : SubTree, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, rootPath : Path | string, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(ctx : RequestContext, _rootPath : Path | string | SubTree | ResourceType | SimpleCallback, _tree : SubTree | ResourceType | SimpleCallback, _callback ?: SimpleCallback)
    {
        const callback = _callback ? _callback : _tree as SimpleCallback;
        const tree = _callback ? _tree as SubTree | ResourceType : _rootPath as SubTree | ResourceType;
        const rootPath = _callback ? new Path(_rootPath as Path | string) : new Path('/');

        if(tree.constructor === ResourceType)
        {
            issuePrivilegeCheck(this, ctx, rootPath, 'canWrite', callback, () => {
                this.create(ctx, rootPath, tree as ResourceType, callback);
            })
        }
        else
        {
            new Workflow()
                .each(Object.keys(tree), (name, cb) => {
                    const value = tree[name];
                    const childPath = rootPath.getChildPath(name);
                    if(value.constructor === ResourceType)
                        this.addSubTree(ctx, childPath, value, cb)
                    else
                        this.addSubTree(ctx, childPath, ResourceType.Directory, (e) => {
                            if(e)
                                return cb(e);
                                
                            this.addSubTree(ctx, childPath, value, cb);
                        })
                })
                .error(callback)
                .done(() => callback());
        }
    }

    listDeepLocks(ctx : RequestContext, startPath : Path | string, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(ctx : RequestContext, startPath : Path | string, depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(ctx : RequestContext, startPath : Path | string, _depth : number | ReturnCallback<{ [path : string] : Lock[] }>, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        const depth = _callback ? _depth as number : 0;
        const callback = _callback ? _callback : _depth as ReturnCallback<{ [path : string] : Lock[] }>;
        const pStartPath = new Path(startPath);
        
        issuePrivilegeCheck(this, ctx, startPath, 'canReadLocks', callback, () => {
            this.lockManager(ctx, pStartPath, (e, lm) => {
                if(e === Errors.ResourceNotFound)
                {
                    lm = {
                        getLocks(callback : ReturnCallback<Lock[]>) : void
                        {
                            callback(null, []);
                        }
                    } as ILockManager;
                }
                else if(e)
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
                                pLocks[pStartPath.toString()] = locks;
                            callback(null, pLocks);
                        })
                    }

                    if(!pStartPath.isRoot())
                        return go(this, pStartPath.getParent());
                    
                    this.getFullPath(ctx, (e, fsPath) => {
                        if(e)
                            return callback(e);
                        
                        if(fsPath.isRoot())
                        {
                            const result = {};
                            if(locks && locks.length > 0)
                                result[pStartPath.toString()] = locks;
                            return callback(null, result);
                        }
                        
                        ctx.server.getFileSystem(fsPath.getParent(), (fs, _, subPath) => {
                            go(fs, subPath);
                        })
                    })
                })
            })
        })
    }

    getFullPath(ctx : RequestContext, callback : ReturnCallback<Path>)
    getFullPath(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Path>)
    getFullPath(ctx : RequestContext, _path : Path | string | ReturnCallback<Path>, _callback ?: ReturnCallback<Path>)
    {
        const path = _callback ? new Path(_path as Path | string) : undefined;
        const callback = _callback ? _callback : _path as ReturnCallback<Path>;
        
        ctx.server.getFileSystemPath(this, (fsPath) => {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        })
    }

    localize(ctx : RequestContext, fullPath : Path, callback : ReturnCallback<Path[]>)
    localize(ctx : RequestContext, fullPath : Path[], callback : ReturnCallback<Path[]>)
    localize(ctx : RequestContext, fullPath : string, callback : ReturnCallback<Path[]>)
    localize(ctx : RequestContext, fullPath : string[], callback : ReturnCallback<Path[]>)
    localize(ctx : RequestContext, fullPath : (string | Path)[], callback : ReturnCallback<Path[]>)
    localize(ctx : RequestContext, fullPath : Path | string | (string | Path)[], callback : ReturnCallback<Path[]>)
    {
        this.getFullPath(ctx, (e, fsFullPath) => {
            if(e)
                return callback(e);
            
            const paths = fullPath.constructor === Array ? fullPath as any[] : [ fullPath as any ];

            callback(null, paths
                .map((p) => new Path(p))
                .map((p) => {
                    for(let i = 0; i < fsFullPath.paths.length; ++i)
                        p.removeRoot();
                    return p;
                })
            );
        })
    }

    checkPrivilege(ctx : RequestContext, path : Path | string, privilege : BasicPrivilege, callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privileges : BasicPrivilege[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privilege : string, callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privileges : string[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privileges : BasicPrivilege | BasicPrivilege[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privileges : string | string[], callback : ReturnCallback<boolean>)
    checkPrivilege(ctx : RequestContext, path : Path | string, privileges : string | string[] | BasicPrivilege | BasicPrivilege[], callback : ReturnCallback<boolean>)
    {
        if(privileges.constructor === String)
            privileges = [ privileges as string ];
        
        this.getFullPath(ctx, path, (e, fullPath) => {
            this.privilegeManager(ctx, path, (e, privilegeManager) => {
                if(e)
                    return callback(e);
                
                const resource = this.resource(ctx, new Path(path));
                privilegeManager.can(fullPath, resource, privileges as string[], callback);
            })
        })
    }

    privilegeManager(ctx : RequestContext, path : Path | string, callback : ReturnCallback<PrivilegeManager>)
    {
        if(!this._privilegeManager)
            return callback(null, ctx.server.options.privilegeManager);
        
        this._privilegeManager(new Path(path), {
            context: ctx
        }, callback);
    }
    protected _privilegeManager?(path : Path, info : PrivilegeManagerInfo, callback : ReturnCallback<PrivilegeManager>)

    isLocked(ctx : RequestContext, path : Path | string, callback : ReturnCallback<boolean>)
    {
        this.listDeepLocks(ctx, path, (e, locks) => {
            if(e)
                return callback(e);

            for(const path in locks)
                if(locks[path].some((l) => ctx.user.uid !== l.userUid && l.lockKind.scope.isSame(LockScope.Exclusive)))
                    return callback(null, true);
                    
            let isShared = false;
            for(const path in locks)
                for(const lock of locks[path])
                {
                    if(lock.lockKind.scope.isSame(LockScope.Shared))
                    {
                        isShared = true;
                        if(lock.userUid === ctx.user.uid)
                            return callback(null, false);
                    }
                }
            
            callback(null, isShared);
        })
    }

    serialize(callback : ReturnCallback<any>) : void
    {
        this.serializer().serialize(this, callback);
    }
}

function issuePrivilegeCheck(fs : FileSystem, ctx : RequestContext, path : Path | string, privilege : BasicPrivilege | BasicPrivilege[], badCallback : SimpleCallback, goodCallback : () => void)
{
    fs.checkPrivilege(ctx, path, privilege, (e, can) => {
        if(e)
            badCallback(e);
        else if(!can)
            badCallback(Errors.NotEnoughPrivilege);
        else
            goodCallback();
    })
}
