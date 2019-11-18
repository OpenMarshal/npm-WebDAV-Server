// tslint:disable:max-file-line-count max-line-length
import {
    PrivilegeManagerInfo,
    AvailableLocksInfo,
    CopyInfo,
    CreateInfo,
    CreationDateInfo,
    DeleteInfo,
    DisplayNameInfo,
    ETagInfo,
    LastModifiedDateInfo,
    LockManagerInfo,
    MimeTypeInfo,
    MoveInfo,
    OpenReadStreamInfo,
    OpenWriteStreamInfo,
    PropertyManagerInfo,
    ReadDirInfo,
    RenameInfo,
    SizeInfo,
    TypeInfo
} from './ContextInfo'
import {
    ResourceType,
    SimpleCallback,
    Return2Callback,
    ReturnCallback,
    SubTree,
    OpenWriteStreamMode,
    ResourcePropertyValue,
    PropertyAttributes
} from './CommonTypes'
import { ISerializableFileSystem, FileSystemSerializer } from './Serialization'
import { BasicPrivilege, PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager'
import { FileSystemEvent, WebDAVServer } from '../../../server/v2/webDAVServer/WebDAVServer'
import { Readable, Writable, Transform } from 'stream'
import { IPropertyManager, PropertyBag } from './PropertyManager'
import { ContextualFileSystem } from './ContextualFileSystem'
import { StandardMethods } from './StandardMethods'
import { RequestContext } from '../../../server/v2/RequestContext'
import { ILockManager, ILockManagerAsync } from './LockManager'
import { LockScope } from '../../../resource/v2/lock/LockScope'
import { LockType } from '../../../resource/v2/lock/LockType'
import { LockKind } from '../../../resource/v2/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Resource } from './Resource'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/v2/lock/Lock'
import { Path } from '../Path'
import * as crypto from 'crypto'
import { ensureValue, promisifyCall } from '../../../helper/v2/promise'

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

/**
 * File system which manage resources under its mounted path.
 * 
 * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Custom-File-System-%5Bv2%5D
 */
export abstract class FileSystem implements ISerializableFileSystem
{
    private __serializer;

    constructor(serializer : FileSystemSerializer)
    {
        this.__serializer = serializer;
    }
    
    /**
     * Get the serializer.
     */
    serializer() : FileSystemSerializer
    {
        return this.__serializer;
    }

    /**
     * Defines the serializer to use.
     * 
     * @param serializer Serializer to use.
     */
    setSerializer(serializer : FileSystemSerializer)
    {
        this.__serializer = serializer;
    }

    /**
     * Tell to not serialize this file system.
     */
    doNotSerialize()
    {
        this.__serializer = null;
    }

    /**
     * Wrap the file system with the context.
     * 
     * @param ctx Context of the operation.
     */
    contextualize(ctx : RequestContext) : ContextualFileSystem
    {
        return new ContextualFileSystem(this, ctx);
    }

    /**
     * Wrap the file system with the context and a resource path.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    resource(ctx : RequestContext, path : Path) : Resource
    {
        return new Resource(path, this, ctx);
    }
    
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'errorCallback' is called, otherwise the 'callback' is called.
     * 
     * This method will not give a true information, but just an estimate of the existence of a resource.
     * 
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource is sure to not exist.
     * @param callback Callback to call when the resource might exists.
     */
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
    
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'callback' is called, otherwise the 'errorCallback' is called.
     * 
     * This method will not give a true information, but just an estimate of the existence of a resource.
     * 
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource might exists.
     * @param callback Callback to call when the resource is sure to not exist.
     */
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

    /**
     * Make a fast check if a resource exists.
     * This method will call '_fastExistCheck' if it is implemented or return 'true'.
     * 
     * This method will not give a true information, but just an estimate of the existence of a resource.
     * 
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns if the resource exists.
     */
    protected fastExistCheck(ctx : RequestContext, _path : Path | string, callback : (exists : boolean) => void) : void
    {
        if(!this._fastExistCheck)
            return callback(true);
        
        const path = new Path(_path);
        this._fastExistCheck(ctx, path, (exists) => callback(!!exists));
    }
    protected _fastExistCheck?(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void

    /**
     * Create a new resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     */
    createAsync(ctx : RequestContext, path : Path | string, type : ResourceType) : Promise<void>
    /**
     * Create a new resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param createIntermediates Defines if the operation is allowed to create intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     */
    createAsync(ctx : RequestContext, path : Path | string, type : ResourceType, createIntermediates : boolean) : Promise<void>
    createAsync(ctx : RequestContext, path : Path | string, type : ResourceType, createIntermediates ?: boolean) : Promise<void>
    {
        return promisifyCall((cb) => this.create(ctx, path, type, createIntermediates, cb));
    }

    /**
     * Create a new resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param callback Returns an error if one occured.
     */
    create(ctx : RequestContext, path : Path | string, type : ResourceType, callback : SimpleCallback) : void
    /**
     * Create a new resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param type Type of the resource to create.
     * @param createIntermediates Defines if the operation is allowed to create intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param callback Returns an error if one occured.
     */
    create(ctx : RequestContext, path : Path | string, type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(ctx : RequestContext, _path : Path | string, type : ResourceType, _createIntermediates : boolean | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const createIntermediates = ensureValue(_callback ? _createIntermediates as boolean : undefined, false);
        const callbackFinal = _callback ? _callback : _createIntermediates as SimpleCallback;
        const path = new Path(_path);

        const callback : SimpleCallback = (e) => {
            if(!e)
                this.emit('create', ctx, path, { type, createIntermediates })
            callbackFinal(e);
        }

        if(!this._create)
            return callback(Errors.InvalidOperation);

        this.emit('before-create', ctx, path, { type, createIntermediates })
        
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, () => {
            const go = () => {
                ctx.server.options.storageManager.evaluateCreate(ctx, this, path, type, (size) => {
                ctx.server.options.storageManager.reserve(ctx, this, size, (reserved) => {
                    if(!reserved)
                        return callback(Errors.InsufficientStorage);

                    this._create(path, {
                        context: ctx,
                        type
                    }, (e) => {
                        if(e)
                            ctx.server.options.storageManager.reserve(ctx, this, -size, () => callback(e));
                        else
                            callback();
                    });
                })
                })
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
                                    
                                    r.create(ResourceType.Directory, true, (e) => {
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

    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     * 
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     */
    etagAsync(ctx : RequestContext, path : Path | string) : Promise<string>
    {
        return promisifyCall((cb) => this.etag(ctx, path, cb))
    }

    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     * 
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns the etag of the resource.
     */
    etag(ctx : RequestContext, _path : Path | string, callback : ReturnCallback<string>) : void
    {
        const path = new Path(_path);

        issuePrivilegeCheck(this, ctx, path, 'canReadProperties', callback, () => {
            this.fastExistCheckEx(ctx, path, callback, () => {
                if(!this._etag)
                    return this.lastModifiedDate(ctx, path, (e, date) => {
                        if(e)
                            return callback(e);
                        
                        date = FileSystem.neutralizeEmptyDate(date);

                        callback(null, '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"');
                    })

                this._etag(path, {
                    context: ctx
                }, callback);
            })
        })
    }
    protected _etag?(path : Path, ctx : ETagInfo, callback : ReturnCallback<string>) : void

    /**
     * Delete a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    deleteAsync(ctx : RequestContext, path : Path | string) : Promise<void>
    /**
     * Delete a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param depth Depth of the delete. Might be ignored depending on the implementation.
     */
    deleteAsync(ctx : RequestContext, path : Path | string, depth : number) : Promise<void>
    deleteAsync(ctx : RequestContext, path : Path | string, depth ?: number) : Promise<void>
    {
        return promisifyCall((cb) => this.delete(ctx, path, depth, cb))
    }

    /**
     * Delete a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns an error if one occured.
     */
    delete(ctx : RequestContext, path : Path | string, callback : SimpleCallback) : void
    /**
     * Delete a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param depth Depth of the delete. Might be ignored depending on the implementation.
     * @param callback Returns an error if one occured.
     */
    delete(ctx : RequestContext, path : Path | string, depth : number, callback : SimpleCallback) : void
    delete(ctx : RequestContext, _path : Path | string, _depth : number | SimpleCallback, _callback ?: SimpleCallback) : void
    {
        const depth = ensureValue(_callback ? _depth as number : undefined, -1);
        const callbackFinal = _callback ? _callback : _depth as SimpleCallback;
        const path = new Path(_path);

        const callback : SimpleCallback = (e) => {
            if(!e)
                this.emit('delete', ctx, path, { depth })
            callbackFinal(e);
        }

        if(!this._delete)
            return callback(Errors.InvalidOperation);

        this.emit('before-delete', ctx, path, { depth })

        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, () => {
            this.isLocked(ctx, path, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                this.fastExistCheckEx(ctx, path, callback, () => {
                    this.size(ctx, path, (e, contentSize) => {
                        contentSize = contentSize || 0;

                        this._delete(path, {
                            context: ctx,
                            depth
                        }, (e) => {
                            if(!e)
                            {
                                this.type(ctx, path, (e, type) => {
                                    ctx.server.options.storageManager.evaluateContent(ctx, this, contentSize, (reservedContentSize) => {
                                    ctx.server.options.storageManager.evaluateCreate(ctx, this, path, type, (size) => {
                                        ctx.server.options.storageManager.reserve(ctx, this, -size - reservedContentSize, () => {
                                            callback();
                                        })
                                    })
                                    })
                                })
                            }
                            else
                                callback(e);
                        });
                    });
                })
            })
        })
    }
    protected _delete?(path : Path, ctx : DeleteInfo, callback : SimpleCallback) : void
    
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, targetSource : boolean) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean) : Promise<{ stream : Writable, created : boolean }>
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     */
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(ctx : RequestContext, path : Path | string, mode ?: any, targetSource ?: any, estimatedSize ?: any) : Promise<{ stream : Writable, created : boolean }>
    {
        return promisifyCall((cb) => this.openWriteStream(ctx, path, mode, targetSource, estimatedSize, (e, data1, data2) => cb(e, e ? undefined : { stream: data1, created: data2 })));
    }

    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    /**
     * Open a stream to write the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param mode Define if this operation can/must create a new resource and/or its intermediate resources ('/folder1/folder2/file3', if 'folder2' doesn't exist, it is an intermediate).
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to write.
     * @param callback Returns the stream.
     */
    openWriteStream(ctx : RequestContext, path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(ctx : RequestContext, _path : Path | string, _mode : OpenWriteStreamMode | boolean | number | Return2Callback<Writable, boolean>, _targetSource ?: boolean | number | Return2Callback<Writable, boolean>, _estimatedSize ?: number | Return2Callback<Writable, boolean>, _callback ?: Return2Callback<Writable, boolean>) : void
    {
        let targetSource = false;
        for(const obj of [ _mode, _targetSource ])
            if(obj && obj.constructor === Boolean)
                targetSource = obj as boolean;

        let estimatedSize = -1;
        for(const obj of [ _mode, _targetSource, _estimatedSize ])
            if(obj && obj.constructor === Number)
                estimatedSize = obj as number;

        let callbackFinal;
        for(const obj of [ _mode, _targetSource, _estimatedSize, _callback ])
            if(obj && obj.constructor === Function)
                callbackFinal = obj as Return2Callback<Writable, boolean>;
        
        const mode = _mode && _mode.constructor === String ? _mode as OpenWriteStreamMode : 'mustExist';
        const path = new Path(_path);
        let created = false;

        const callback : Return2Callback<Writable, boolean> = (e, stream, created) => {
            if(!e)
                this.emit('openWriteStream', ctx, path, { targetSource, mode, estimatedSize, created, stream })
            callbackFinal(e, stream, created);
        }
        
        if(!this._openWriteStream)
            return callback(Errors.InvalidOperation);

        this.emit('before-openWriteStream', ctx, path, { targetSource, mode, estimatedSize, created })
        
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canWriteContentSource' : 'canWriteContentTranslated', callback, () => {
            this.isLocked(ctx, path, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                const finalGo = (callback : Return2Callback<Writable, boolean>) =>
                {
                    this._openWriteStream(path, {
                        context: ctx,
                        estimatedSize,
                        targetSource,
                        mode
                    }, (e, wStream) => callback(e, wStream, created));
                }
                const go = (callback : Return2Callback<Writable, boolean>) =>
                {
                    this.size(ctx, path, true, (e, size) => {
                        ctx.server.options.storageManager.evaluateContent(ctx, this, size, (sizeStored) => {
                            if(estimatedSize === undefined || estimatedSize === null || estimatedSize.constructor === Number && estimatedSize <= 0)
                            {
                                ctx.server.options.storageManager.available(ctx, this, (available) => {
                                    if(available === -1)
                                        return finalGo(callback);
                                    if(available === 0)
                                        return callback(Errors.InsufficientStorage);

                                    let nb = 0;
                                    finalGo((e, wStream, created) => {
                                        if(e)
                                            return callback(e, wStream, created);

                                        const stream = new Transform({
                                            transform(chunk, encoding, callback)
                                            {
                                                nb += chunk.length;
                                                if(nb > available)
                                                    callback(Errors.InsufficientStorage);
                                                else
                                                    callback(null, chunk, encoding);
                                            }
                                        });
                                        stream.pipe(wStream);
                                        stream.on('finish', () => {
                                            ctx.server.options.storageManager.reserve(ctx, this, nb, (reserved) => {
                                                if(!reserved)
                                                    stream.emit('error', Errors.InsufficientStorage);
                                            })
                                        })
                                        callback(e, stream, created);
                                    })
                                })
                            }
                            else
                            {
                                ctx.server.options.storageManager.evaluateContent(ctx, this, estimatedSize, (estimatedSizeStored) => {
                                ctx.server.options.storageManager.reserve(ctx, this, estimatedSizeStored - sizeStored, (reserved) => {
                                    if(!reserved)
                                        return callback(Errors.InsufficientStorage);
                                    finalGo(callback);
                                })
                                })
                            }
                        })
                    })
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
    
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    openReadStreamAsync(ctx : RequestContext, path : Path | string) : Promise<Readable>
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to read.
     */
    openReadStreamAsync(ctx : RequestContext, path : Path | string, estimatedSize : number) : Promise<Readable>
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    openReadStreamAsync(ctx : RequestContext, path : Path | string, targetSource : boolean) : Promise<Readable>
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to read.
     */
    openReadStreamAsync(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number) : Promise<Readable>
    openReadStreamAsync(ctx : RequestContext, path : Path | string, targetSource ?: any, estimatedSize ?: any) : Promise<Readable>
    {
        return promisifyCall((cb) => this.openReadStream(ctx, path, targetSource, estimatedSize, cb))
    }
    
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the stream.
     */
    openReadStream(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Readable>) : void
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param estimatedSize Estimate of the size to read.
     * @param callback Returns the stream.
     */
    openReadStream(ctx : RequestContext, path : Path | string, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the stream.
     */
    openReadStream(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<Readable>) : void
    /**
     * Open a stream to read the content of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param estimatedSize Estimate of the size to read.
     * @param callback Returns the stream.
     */
    openReadStream(ctx : RequestContext, path : Path | string, targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(ctx : RequestContext, _path : Path | string, _targetSource : boolean | number | ReturnCallback<Readable>, _estimatedSize ?: number | ReturnCallback<Readable>, _callback ?: ReturnCallback<Readable>) : void
    {
        const targetSource = ensureValue(_targetSource.constructor === Boolean ? _targetSource as boolean : undefined, false);
        const estimatedSize = ensureValue(_callback ? _estimatedSize as number : _estimatedSize ? _targetSource as number : undefined, -1);
        const callbackFinal = _callback ? _callback : _estimatedSize ? _estimatedSize as ReturnCallback<Readable> : _targetSource as ReturnCallback<Readable>;
        const path = new Path(_path);

        const callback : ReturnCallback<Readable> = (e, stream) => {
            if(!e)
                this.emit('openReadStream', ctx, path, { targetSource, estimatedSize, stream })
            callbackFinal(e, stream);
        }

        this.emit('before-openReadStream', ctx, path, { targetSource, estimatedSize })
        
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

    /**
     * Move a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     */
    moveAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string) : Promise<boolean>
    /**
     * Move a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param overwrite 
     */
    moveAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean) : Promise<boolean>
    moveAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite ?: boolean) : Promise<boolean>
    {
        return promisifyCall((cb) => this.move(ctx, pathFrom, pathTo, overwrite, cb))
    }

    /**
     * Move a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    move(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    /**
     * Move a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to move.
     * @param pathTo Destination path to where move the resource.
     * @param overwrite 
     * @param callback Returns if the resource has been owerwritten.
     */
    move(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(ctx : RequestContext, _pathFrom : Path | string, _pathTo : Path | string, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const callbackFinal = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const overwrite = ensureValue(_callback ? _overwrite as boolean : undefined, false);
        const pathFrom = new Path(_pathFrom);
        const pathTo = new Path(_pathTo);

        const callback : ReturnCallback<boolean> = (e, overrided) => {
            if(!e)
                this.emit('move', ctx, pathFrom, { pathFrom, pathTo, overwrite, overrided })
            callbackFinal(e, overrided);
        }

        this.emit('before-move', ctx, pathFrom, { pathFrom, pathTo, overwrite })

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

                        StandardMethods.standardMove(ctx, pathFrom, this, pathTo, this, overwrite, callback);
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

    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     */
    copyAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string) : Promise<boolean>
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param depth Depth to make the copy. (Infinite = -1)
     */
    copyAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, depth : number) : Promise<boolean>
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite 
     */
    copyAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean) : Promise<boolean>
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite 
     * @param depth Depth to make the copy. (Infinite = -1)
     */
    copyAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, depth : number) : Promise<boolean>
    copyAsync(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite ?: any, depth ?: any) : Promise<boolean>
    {
        return promisifyCall((cb) => this.copy(ctx, pathFrom, pathTo, overwrite, depth))
    }

    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param depth Depth to make the copy. (Infinite = -1)
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, depth : number, callback : ReturnCallback<boolean>) : void
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite 
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    /**
     * Copy a resource.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to copy.
     * @param pathTo Destination path to where copy the resource.
     * @param overwrite 
     * @param depth Depth to make the copy. (Infinite = -1)
     * @param callback Returns if the resource has been owerwritten.
     */
    copy(ctx : RequestContext, pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(ctx : RequestContext, _pathFrom : Path | string, _pathTo : Path | string, _overwrite : boolean | number | ReturnCallback<boolean>, _depth ?: number | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = ensureValue(_overwrite.constructor === Boolean ? _overwrite as boolean : undefined, false);
        const depth = ensureValue(_callback ? _depth as number : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite as number : undefined, -1);
        const callbackFinal = _callback ? _callback : _depth ? _depth as ReturnCallback<boolean> : _overwrite as ReturnCallback<boolean>;
        const pathFrom = new Path(_pathFrom);
        const pathTo = new Path(_pathTo);

        const callback : ReturnCallback<boolean> = (e, overrided) => {
            if(!e)
                this.emit('copy', ctx, pathFrom, { pathTo, overwrite, overrided, depth })
            callbackFinal(e, overrided);
        }
        
        this.emit('before-copy', ctx, pathFrom, { pathTo, overwrite, depth })

        issuePrivilegeCheck(this, ctx, pathFrom, 'canRead', callback, () => {
        issuePrivilegeCheck(this, ctx, pathTo, 'canWrite', callback, () => {
            this.isLocked(ctx, pathTo, (e, isLocked) => {
                if(e || isLocked)
                    return callback(e ? e : Errors.Locked);
                
                const go = () =>
                {
                    if(this._copy)
                    {
                        this._copy(pathFrom, pathTo, {
                            context: ctx,
                            depth,
                            overwrite
                        }, callback);
                        return;
                    }
                    
                    StandardMethods.standardCopy(ctx, pathFrom, this, pathTo, this, overwrite, depth, callback);
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
    }
    protected _copy?(pathFrom : Path, pathTo : Path, ctx : CopyInfo, callback : ReturnCallback<boolean>) : void

    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     */
    renameAsync(ctx : RequestContext, pathFrom : Path | string, newName : string) : Promise<boolean>
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param overwrite 
     */
    renameAsync(ctx : RequestContext, pathFrom : Path | string, newName : string, overwrite : boolean) : Promise<boolean>
    renameAsync(ctx : RequestContext, pathFrom : Path | string, newName : string, overwrite ?: boolean) : Promise<boolean>
    {
        return promisifyCall((cb) => this.rename(ctx, pathFrom, newName, overwrite, cb))
    }

    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param callback Returns if the resource has been owerwritten.
     */
    rename(ctx : RequestContext, pathFrom : Path | string, newName : string, callback : ReturnCallback<boolean>) : void
    /**
     * Rename the resource.
     * By default, if the '_rename' method is not implemented, it makes a move.
     * 
     * @param ctx Context of the operation.
     * @param pathFrom Path of the resource to rename.
     * @param newName New name of the resource.
     * @param overwrite 
     * @param callback Returns if the resource has been owerwritten.
     */
    rename(ctx : RequestContext, pathFrom : Path | string, newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(ctx : RequestContext, _pathFrom : Path | string, newName : string, _overwrite : boolean | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>) : void
    {
        const overwrite = ensureValue(_callback ? _overwrite as boolean : undefined, false);
        const callbackFinal = _callback ? _callback : _overwrite as ReturnCallback<boolean>;
        const pathFrom = new Path(_pathFrom);

        const callback : ReturnCallback<boolean> = (e, overrided) => {
            if(!e)
                this.emit('rename', ctx, pathFrom, { newName, overrided })
            callbackFinal(e, overrided);
        }
        
        this.emit('before-rename', ctx, pathFrom, { newName })

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
                                {
                                    go(false);
                                }
                                else if(!overwrite)
                                {
                                    callback(Errors.ResourceAlreadyExists);
                                }
                                else
                                {
                                    ctx.server.removeFileSystem(newPath, () => {
                                        go(true);
                                    })
                                }
                            })
                        })
                    })
                }
                else
                {
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
                                }
                                else
                                {
                                    this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
                                }
                            })
                        })
                    })
                    })
                }
            })
        })
    }
    protected _rename?(pathFrom : Path, newName : string, ctx : RenameInfo, callback : ReturnCallback<boolean>) : void

    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    mimeTypeAsync(ctx : RequestContext, path : Path | string) : Promise<string>
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    mimeTypeAsync(ctx : RequestContext, path : Path | string, targetSource : boolean) : Promise<string>
    mimeTypeAsync(ctx : RequestContext, path : Path | string, targetSource ?: boolean) : Promise<string>
    {
        return promisifyCall((cb) => this.mimeType(ctx, path, targetSource, cb))
    }

    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the mime type and the encoding of the resource.
     */
    mimeType(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string>) : void
    /**
     * Get the mime type and the encoding of the resource's content.
     * By default, it uses the file name of the resource to determine its mime type and its encoding.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the mime type and the encoding of the resource.
     */
    mimeType(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(ctx : RequestContext, _path : Path | string, _targetSource : boolean | ReturnCallback<string>, _callback ?: ReturnCallback<string>) : void
    {
        const targetSource = ensureValue(_callback ? _targetSource as boolean : undefined, true);
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
                }
                else
                {
                    StandardMethods.standardMimeType(ctx, this, path, targetSource, callback);
                }
            })
        })
    }
    protected _mimeType?(path : Path, ctx : MimeTypeInfo, callback : ReturnCallback<string>) : void

    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    sizeAsync(ctx : RequestContext, path : Path | string) : Promise<number>
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     */
    sizeAsync(ctx : RequestContext, path : Path | string, targetSource : boolean) : Promise<number>
    sizeAsync(ctx : RequestContext, path : Path | string, targetSource ?: boolean) : Promise<number>
    {
        return promisifyCall((cb) => this.size(ctx, path, targetSource, cb))
    }

    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the size of the resource.
     */
    size(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    /**
     * Get the size of the resource's content.
     * If the '_size' method is not implemented, it returns 'undefined'.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param targetSource Define if the content must be the source or the computed content. Might make no difference depending on the implementation.
     * @param callback Returns the size of the resource.
     */
    size(ctx : RequestContext, path : Path | string, targetSource : boolean, callback : ReturnCallback<number>) : void
    size(ctx : RequestContext, path : Path | string, _targetSource : boolean | ReturnCallback<number>, _callback ?: ReturnCallback<number>) : void
    {
        const targetSource = ensureValue(_callback ? _targetSource as boolean : undefined, false);
        const callback = _callback ? _callback : _targetSource as ReturnCallback<number>;
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._size)
                    return callback(null, undefined);

                this._size(pPath, {
                    context: ctx,
                    targetSource
                }, callback);
            })
        })
    }
    protected _size?(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void

    /**
     * Get the list of available lock kinds.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    availableLocksAsync(ctx : RequestContext, path : Path | string) : Promise<LockKind[]>
    {
        return promisifyCall((cb) => this.availableLocks(ctx, path, cb))
    }

    /**
     * Get the list of available lock kinds.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the list of available lock kinds.
     */
    availableLocks(ctx : RequestContext, path : Path | string, callback : ReturnCallback<LockKind[]>) : void
    {
        const pPath = new Path(path);

        issuePrivilegeCheck(this, ctx, pPath, 'canReadLocks', callback, () => {
            this.fastExistCheckEx(ctx, pPath, callback, () => {
                if(!this._availableLocks)
                {
                    callback(null, [
                        new LockKind(LockScope.Exclusive, LockType.Write),
                        new LockKind(LockScope.Shared, LockType.Write)
                    ]);
                }
                else
                {
                    this._availableLocks(pPath, {
                        context: ctx
                    }, callback);
                }
            })
        })
    }
    protected _availableLocks?(path : Path, ctx : AvailableLocksInfo, callback : ReturnCallback<LockKind[]>) : void

    /**
     * Get the lock manager of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    lockManagerAsync(ctx : RequestContext, path : Path | string) : Promise<ILockManagerAsync>
    {
        return promisifyCall((cb) => this.lockManager(ctx, path, cb))
    }

    /**
     * Get the lock manager of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the lock manager of the resource.
     */
    lockManager(ctx : RequestContext, path : Path | string, callback : ReturnCallback<ILockManagerAsync>) : void
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
                const manager = {
                    getLocksAsync() : Promise<Lock[]>
                    {
                        return promisifyCall((cb) => manager.getLocks(cb));
                    },
                    getLocks(callback : ReturnCallback<Lock[]>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, () => {
                            lm.getLocks(callback);
                        })
                    },
                    setLockAsync(lock : Lock) : Promise<void>
                    {
                        return promisifyCall((cb) => manager.setLock(lock, cb));
                    },
                    setLock(lock : Lock, callback : SimpleCallback) : void
                    {
                        fs.emit('before-lock-set', ctx, pPath, { lock });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.setLock(lock, (e) => {
                                    if(!e)
                                        fs.emit('lock-set', ctx, pPath, { lock });
                                    callback(e);
                                });
                            })
                        })
                    },
                    removeLockAsync(uuid : string) : Promise<boolean>
                    {
                        return promisifyCall((cb) => manager.removeLock(uuid, cb));
                    },
                    removeLock(uuid : string, callback : ReturnCallback<boolean>) : void
                    {
                        fs.emit('before-lock-remove', ctx, pPath, { uuid });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.removeLock(uuid, (e, removed) => {
                                    if(!e)
                                        fs.emit('lock-remove', ctx, pPath, { uuid, removed });
                                    callback(e, removed);
                                });
                            })
                        })
                    },
                    getLockAsync(uuid : string) : Promise<Lock>
                    {
                        return promisifyCall((cb) => manager.getLock(uuid, cb));
                    },
                    getLock(uuid : string, callback : ReturnCallback<Lock>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, () => {
                            lm.getLock(uuid, callback);
                        })
                    },
                    refreshAsync(uuid : string, timeoutSeconds : number) : Promise<Lock>
                    {
                        return promisifyCall((cb) => manager.refresh(uuid, timeoutSeconds, cb));
                    },
                    refresh(uuid : string, timeoutSeconds : number, callback : ReturnCallback<Lock>) : void
                    {
                        fs.emit('before-lock-refresh', ctx, pPath, { uuid, timeout: timeoutSeconds });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                lm.refresh(uuid, timeoutSeconds, (e, lock) => {
                                    if(!e)
                                        fs.emit('lock-refresh', ctx, pPath, { uuid, timeout: timeoutSeconds, lock });
                                    callback(e, lock);
                                });
                            })
                        })
                    }
                };

                callback(null, manager)
            });
        })
    }
    protected abstract _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void

    /**
     * Get the property manager of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    propertyManagerAsync(ctx : RequestContext, path : Path | string) : Promise<IPropertyManager>
    {
        return promisifyCall((cb) => this.propertyManager(ctx, path, cb))
    }

    /**
     * Get the property manager of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the property manager of the resource.
     */
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
                    setProperty(name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : SimpleCallback) : void
                    {
                        fs.emit('before-property-set', ctx, pPath, { name, value, attributes });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                pm.setProperty(name, value, attributes, (e) => {
                                    if(!e)
                                        fs.emit('property-set', ctx, pPath, { name, value, attributes });
                                    callback(e);
                                });
                            })
                        })
                    },
                    getProperty(name : string, callback : Return2Callback<ResourcePropertyValue, PropertyAttributes>) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, () => {
                            pm.getProperty(name, callback);
                        })
                    },
                    removeProperty(name : string, callback : SimpleCallback) : void
                    {
                        fs.emit('before-property-remove', ctx, pPath, { name });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, () => {
                            buffIsLocked.isLocked((e, isLocked) => {
                                if(e || isLocked)
                                    return callback(e ? e : Errors.Locked);
                                
                                pm.removeProperty(name, (e) => {
                                    if(!e)
                                        fs.emit('property-remove', ctx, pPath, { name });
                                    callback(e);
                                });
                            })
                        })
                    },
                    getProperties(callback : ReturnCallback<PropertyBag>, byCopy ?: boolean) : void
                    {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, () => {
                            pm.getProperties((e, bag) => {
                                if(!bag)
                                    return callback(e, bag);

                                ctx.server.options.storageManager.available(ctx, this, (availableSize) => {
                                    if(availableSize === -1)
                                        return callback(e, bag);

                                    ctx.server.options.storageManager.reserved(ctx, this, (reservedSize) => {
                                        bag['DAV:quota-available-bytes'] = {
                                            value: availableSize.toString()
                                        };
                                        bag['DAV:quota-used-bytes'] = {
                                            value: reservedSize.toString()
                                        };
                                        callback(e, bag);
                                    })
                                })
                            }, byCopy);
                        })
                    }
                })
            });
        })
    }
    protected abstract _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void

    /**
     * Get the list of children of a resource.
     * Excludes the external resources, such as file systems mounted as child.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    readDirAsync(ctx : RequestContext, path : Path | string) : Promise<string[]>
    /**
     * Get the list of children of a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param retrieveExternalFiles Define if it must include the resources out of the file system, like other file systems mounted as child.
     */
    readDirAsync(ctx : RequestContext, path : Path | string, retrieveExternalFiles : boolean) : Promise<string[]>
    readDirAsync(ctx : RequestContext, path : Path | string, retrieveExternalFiles ?: boolean) : Promise<string[]>
    {
        return promisifyCall((cb) => this.readDir(ctx, path, retrieveExternalFiles, cb));
    }

    /**
     * Get the list of children of a resource.
     * Excludes the external resources, such as file systems mounted as child.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the list of children (file name) of the resource.
     */
    readDir(ctx : RequestContext, path : Path | string, callback : ReturnCallback<string[]>) : void
    /**
     * Get the list of children of a resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param retrieveExternalFiles Define if it must include the resources out of the file system, like other file systems mounted as child.
     * @param callback Returns the list of children (file name) of the resource.
     */
    readDir(ctx : RequestContext, path : Path | string, retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(ctx : RequestContext, path : Path | string, _retrieveExternalFiles : boolean | ReturnCallback<string[]>, _callback ?: ReturnCallback<string[]>) : void
    {
        const retrieveExternalFiles = ensureValue(_callback ? _retrieveExternalFiles as boolean : undefined, false);
        const __callback = _callback ? _callback : _retrieveExternalFiles as ReturnCallback<string[]>;
        const pPath = new Path(path);
        const callback = (e ?: Error, data ?: Path[]) => {
            if(e)
                return __callback(e);
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
                    .error(__callback)
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

    protected static neutralizeEmptyDate(date : number, defaultDate ?: number) : number
    {
        if(!date || isNaN(date))
        {
            if(defaultDate === undefined || defaultDate === null)
                defaultDate = 0;
            return defaultDate;
        }
        else
        {
            return date;
        }
    }
    protected static neutralizeEmptyDateCallback = (callback : ReturnCallback<number>) : ReturnCallback<number> => {
        return (e : Error, date : number) => {
            callback(e, FileSystem.neutralizeEmptyDate(date));
        }
    }

    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    creationDateAsync(ctx : RequestContext, path : Path | string) : Promise<number>
    {
        return promisifyCall((cb) => this.creationDate(ctx, path, cb));
    }

    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the creation date of the resource.
     */
    creationDate(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    {
        const pPath = new Path(path);
        callback = FileSystem.neutralizeEmptyDateCallback(callback);

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

    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    lastModifiedDateAsync(ctx : RequestContext, path : Path | string) : Promise<number>
    {
        return promisifyCall((cb) => this.lastModifiedDate(ctx, path, cb));
    }

    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the last modified date of the resource.
     */
    lastModifiedDate(ctx : RequestContext, path : Path | string, callback : ReturnCallback<number>) : void
    {
        const pPath = new Path(path);
        callback = FileSystem.neutralizeEmptyDateCallback(callback);

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

    /**
     * Get the name of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    webNameAsync(ctx : RequestContext, path : Path | string) : Promise<string>
    {
        return promisifyCall((cb) => this.webName(ctx, path, cb));
    }

    /**
     * Get the name of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the name of the resource.
     */
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

    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    displayNameAsync(ctx : RequestContext, path : Path | string) : Promise<string>
    {
        return promisifyCall((cb) => this.displayName(ctx, path, cb));
    }

    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the 'displayName' information of the resource.
     */
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

    /**
     * Get the type of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    typeAsync(ctx : RequestContext, path : Path | string) : Promise<ResourceType>
    {
        return promisifyCall((cb) => this.type(ctx, path, cb));
    }

    /**
     * Get the type of the resource.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the type of the resource.
     */
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

    /**
     * Add a sub-tree to the file system at the root.
     * 
     * @param ctx Context of the operation.
     * @param subTree Sub-tree to add.
     */
    addSubTreeAsync(ctx : RequestContext, subTree : SubTree) : Promise<void>
    /**
     * Add a resource to the file system as root.
     * 
     * This method is equivalent to the 'fs.create(ctx, '/', resourceType, callback)' method.
     * 
     * @param ctx Context of the operation.
     * @param resourceType Type of the resource to add.
     */
    addSubTreeAsync(ctx : RequestContext, resourceType : ResourceType | string | Buffer) : Promise<void>
    /**
     * Add a sub-tree to the file system.
     * 
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the sub-tree.
     * @param subTree Sub-tree to add.
     */
    addSubTreeAsync(ctx : RequestContext, rootPath : Path | string, subTree : SubTree) : Promise<void>
    /**
     * Add a resource to the file system.
     * 
     * This method is equivalent to the 'fs.create(ctx, rootPath, resourceType, callback)' method.
     * 
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the resource.
     * @param resourceType Type of the resource to add.
     */
    addSubTreeAsync(ctx : RequestContext, rootPath : Path | string, resourceType : ResourceType | string | Buffer) : Promise<void>
    addSubTreeAsync(ctx : RequestContext, rootPath : any, tree ?: any) : Promise<void>
    {
        return promisifyCall((cb) => this.addSubTree(ctx, rootPath, tree, cb))
    }

    /**
     * Add a sub-tree to the file system at the root.
     * 
     * @param ctx Context of the operation.
     * @param subTree Sub-tree to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx : RequestContext, subTree : SubTree, callback : SimpleCallback) : void
    /**
     * Add a resource to the file system as root.
     * 
     * This method is equivalent to the 'fs.create(ctx, '/', resourceType, callback)' method.
     * 
     * @param ctx Context of the operation.
     * @param resourceType Type of the resource to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx : RequestContext, resourceType : ResourceType | string | Buffer, callback : SimpleCallback) : void
    /**
     * Add a sub-tree to the file system.
     * 
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the sub-tree.
     * @param subTree Sub-tree to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx : RequestContext, rootPath : Path | string, subTree : SubTree, callback : SimpleCallback) : void
    /**
     * Add a resource to the file system.
     * 
     * This method is equivalent to the 'fs.create(ctx, rootPath, resourceType, callback)' method.
     * 
     * @param ctx Context of the operation.
     * @param rootPath Path to which add the resource.
     * @param resourceType Type of the resource to add.
     * @param callback Returns an error if one occured.
     */
    addSubTree(ctx : RequestContext, rootPath : Path | string, resourceType : ResourceType | string | Buffer, callback : SimpleCallback) : void
    addSubTree(ctx : RequestContext, _rootPath : Path | string | SubTree | ResourceType | SimpleCallback | string | Buffer, _tree : SubTree | ResourceType | SimpleCallback | string | Buffer, _callback ?: SimpleCallback) : void
    {
        const _rootPathIsPath = Path.isPath(_rootPath);
        const tree = _rootPathIsPath ? _tree as SubTree | ResourceType : _rootPath as SubTree | ResourceType;
        const rootPath = _rootPathIsPath ? new Path(_rootPath as Path | string) : new Path('/');
        let callback = _callback ? _callback : _tree as SimpleCallback;
        callback = callback ? callback : () => {};

        if(tree.constructor === ResourceType)
        {
            this.create(ctx, rootPath, tree as ResourceType, callback);
        }
        else if(tree.constructor === String || tree.constructor === Buffer)
        {
            const data : String | Buffer = tree as any;
            this.openWriteStream(ctx, rootPath, 'mustCreate', true, data.length, (e, w, created) => {
                if(e)
                    return callback(e);

                w.end(data);
                w.on('error', (e) => {
                    callback(e);
                })
                w.on('finish', () => {
                    callback();
                })
            })
        }
        else
        {
            new Workflow()
                .each(Object.keys(tree), (name, cb) => {
                    const value = tree[name];
                    const childPath = rootPath.getChildPath(name);
                    if(value.constructor === ResourceType || value.constructor === String || value.constructor === Buffer)
                    {
                        this.addSubTree(ctx, childPath, value, cb)
                    }
                    else
                    {
                        this.addSubTree(ctx, childPath, ResourceType.Directory, (e) => {
                            if(e)
                                return cb(e);
                                
                            this.addSubTree(ctx, childPath, value, cb);
                        })
                    }
                })
                .error(callback)
                .done((_) => callback());
        }
    }

    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     * 
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     */
    listDeepLocksAsync(ctx : RequestContext, startPath : Path | string) : Promise<{ [path : string] : Lock[] }>
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     * 
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param depth Depth to filter out-of-range locks (default = 0) (Infinite = -1).
     */
    listDeepLocksAsync(ctx : RequestContext, startPath : Path | string, depth : number) : Promise<{ [path : string] : Lock[] }>
    listDeepLocksAsync(ctx : RequestContext, startPath : Path | string, depth ?: number) : Promise<{ [path : string] : Lock[] }>
    {
        return promisifyCall((cb) => this.listDeepLocks(ctx, startPath, depth, cb))
    }

    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     * 
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param callback Returns an object { path: lock[] }.
     */
    listDeepLocks(ctx : RequestContext, startPath : Path | string, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    /**
     * Search for locks in the parents, starting at the 'startPath' path.
     * 
     * @param ctx Context of the operation.
     * @param startPath Path where to start the research of locks.
     * @param depth Depth to filter out-of-range locks (default = 0) (Infinite = -1).
     * @param callback Returns an object { path: lock[] }.
     */
    listDeepLocks(ctx : RequestContext, startPath : Path | string, depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(ctx : RequestContext, startPath : Path | string, _depth : number | ReturnCallback<{ [path : string] : Lock[] }>, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        const depth = ensureValue(_callback ? _depth as number : undefined, 0);
        const callback = _callback ? _callback : _depth as ReturnCallback<{ [path : string] : Lock[] }>;
        const pStartPath = new Path(startPath);
        
        this.lockManager(ctx, pStartPath, (e, lm) => {
            if(e === Errors.ResourceNotFound)
            {
                lm = {
                    getLocks(callback : ReturnCallback<Lock[]>) : void
                    {
                        callback(null, []);
                    }
                } as ILockManagerAsync;
            }
            else if(e)
            {
                return callback(e);
            }
            
            lm.getLocks((e, locks) => {
                if(e === Errors.NotEnoughPrivilege)
                {
                    locks = [];
                }
                else if(e)
                {
                    return callback(e);
                }
                
                if(depth !== -1)
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
                {
                    go(this, pStartPath.getParent());
                }
                else
                {
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
                }
            })
        })
    }

    /**
     * Get the root based file system path. This can also be understood as getting the mount path of the file system.
     * 
     * @param ctx Context of the operation.
     */
    getFullPathAsync(ctx : RequestContext) : Promise<Path>
    /**
     * Get the root based path.
     * 
     * @example If the file system is mounted on '/folder1', resolving '/folder2/folder3' will result to '/folder1/folder2/folder3'.
     * 
     * @param ctx Context of the operation.
     * @param path Path to resolve.
     */
    getFullPathAsync(ctx : RequestContext, path : Path | string) : Promise<Path>
    getFullPathAsync(ctx : RequestContext, path ?: Path | string) : Promise<Path>
    {
        return promisifyCall((cb) => this.getFullPath(ctx, path, cb));
    }

    /**
     * Get the root based file system path. This can also be understood as getting the mount path of the file system.
     * 
     * @param ctx Context of the operation.
     * @param callback Returns the full path (root based).
     */
    getFullPath(ctx : RequestContext, callback : ReturnCallback<Path>) : void
    /**
     * Get the root based path.
     * 
     * @example If the file system is mounted on '/folder1', resolving '/folder2/folder3' will result to '/folder1/folder2/folder3'.
     * 
     * @param ctx Context of the operation.
     * @param path Path to resolve.
     * @param callback Returns the root based path.
     */
    getFullPath(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Path>) : void
    getFullPath(ctx : RequestContext, _path : Path | string | ReturnCallback<Path>, _callback ?: ReturnCallback<Path>) : void
    {
        const path = !_path || typeof _path === 'function' ? undefined : new Path(_path as Path | string);
        const callback = _callback ? _callback : _path as ReturnCallback<Path>;
        
        ctx.server.getFileSystemPath(this, (fsPath) => {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        })
    }

    /**
     * From the global paths (root based), retrieve the file system local paths (file system based).
     * 
     * @example If the file system is mounted on '/folder1', the path '/folder1/folder2/folder3' will be returned as '/folder2/folder3'.
     * @param ctx Context of the operation.
     * @param fullPath The path or the list of paths to localize in the file system.
     */
    localizeAsync(ctx : RequestContext, fullPath : Path) : Promise<Path[]>
    localizeAsync(ctx : RequestContext, fullPath : Path[]) : Promise<Path[]>
    localizeAsync(ctx : RequestContext, fullPath : string) : Promise<Path[]>
    localizeAsync(ctx : RequestContext, fullPath : string[]) : Promise<Path[]>
    localizeAsync(ctx : RequestContext, fullPath : (string | Path)[]) : Promise<Path[]>
    localizeAsync(ctx : RequestContext, fullPath : Path | string | (string | Path)[]) : Promise<Path[]>
    {
        return promisifyCall((cb) => this.localize(ctx, fullPath as any, cb));
    }

    /**
     * From the global paths (root based), retrieve the file system local paths (file system based).
     * 
     * @example If the file system is mounted on '/folder1', the path '/folder1/folder2/folder3' will be returned as '/folder2/folder3'.
     * @param ctx Context of the operation.
     * @param fullPath The path or the list of paths to localize in the file system.
     * @param callback Returns the list of local paths.
     */
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
                    fsFullPath.paths.forEach(() => p.removeRoot());
                    return p;
                })
            );
        })
    }

    /**
     * Check if the user in the current context (ctx) has ALL privileges requested.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param privilege Privilege or list of privileges to check.
     */
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privilege : BasicPrivilege) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privileges : BasicPrivilege[]) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privilege : string) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privileges : string[]) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privileges : BasicPrivilege | BasicPrivilege[]) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privileges : string | string[]) : Promise<boolean>
    checkPrivilegeAsync(ctx : RequestContext, path : Path | string, privileges : string | string[] | BasicPrivilege | BasicPrivilege[]) : Promise<boolean>
    {
        return promisifyCall((cb) => this.checkPrivilege(ctx, path, privileges as any, cb));
    }

    /**
     * Check if the user in the current context (ctx) has ALL privileges requested.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param privilege Privilege or list of privileges to check.
     * @param callback Returns if the current user has ALL of the privileges.
     */
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

    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    privilegeManagerAsync(ctx : RequestContext, path : Path | string) : Promise<PrivilegeManager>
    {
        return promisifyCall((cb) => this.privilegeManager(ctx, path, cb));
    }

    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the privilege manager representing the requested resource.
     */
    privilegeManager(ctx : RequestContext, path : Path | string, callback : ReturnCallback<PrivilegeManager>)
    {
        if(!this._privilegeManager)
            return callback(null, ctx.server.options.privilegeManager);
        
        this._privilegeManager(new Path(path), {
            context: ctx
        }, callback);
    }
    protected _privilegeManager?(path : Path, info : PrivilegeManagerInfo, callback : ReturnCallback<PrivilegeManager>)

    /**
     * Get if a resource is locked by another user than the one in the context argument or if the user has rights to write to the resource.
     * If the user has locked the resource and there is no conflicting lock, so the resource is considered as "not locked".
     * If the user didn't locked the resource and is not administrator, then the resource is considered as "locked".
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    isLockedAsync(ctx : RequestContext, path : Path | string) : Promise<boolean>
    isLockedAsync(ctx : RequestContext, path : Path | string, depth : number) : Promise<boolean>
    isLockedAsync(ctx : RequestContext, path : Path | string, depth ?: number) : Promise<boolean>
    {
        return promisifyCall((cb) => this.isLockedAsync(ctx, path, depth))
    }

    /**
     * Get if a resource is locked by another user than the one in the context argument or if the user has rights to write to the resource.
     * If the user has locked the resource and there is no conflicting lock, so the resource is considered as "not locked".
     * If the user didn't locked the resource and is not administrator, then the resource is considered as "locked".
     * 
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns if the resource is locked or not (true = locked, cannot write to it ; false = not locked) or returns an error.
     */
    isLocked(ctx : RequestContext, path : Path | string, callback : ReturnCallback<boolean>)
    isLocked(ctx : RequestContext, path : Path | string, depth : number, callback : ReturnCallback<boolean>)
    isLocked(ctx : RequestContext, path : Path | string, _depth : number | ReturnCallback<boolean>, _callback ?: ReturnCallback<boolean>)
    {
        const callback = _callback ? _callback : _depth as ReturnCallback<boolean>;
        const depth = typeof _depth === 'number' ? _depth : 0;

        if(ctx.user && ctx.user.isAdministrator)
            return callback(null, false);
        
        const pPath = new Path(path);

        const checkThis = () => {
            this._lockManager(pPath, { context: ctx }, (e, lm) => {
                if(e === Errors.ResourceNotFound)
                    return callback(null, false);
                if(e)
                    return callback(e);

                lm.getLocks((e, locks) => {
                    if(e === Errors.ResourceNotFound)
                        return callback(null, false);
                    if(e)
                        return callback(e);
                    
                    locks = locks.filter((l) => l.depth === -1 || l.depth >= depth);
                    
                    if(!ctx.user)
                        return callback(null, locks.length > 0);

                    if(locks.some((l) => ctx.user.uid !== l.userUid && l.lockKind.scope.isSame(LockScope.Exclusive)))
                        return callback(null, true);
                            
                    let isShared = false;
                    for(const lock of locks)
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
            })
        }
        
        this.getFullPath(ctx, pPath, (e, fullPath) => {
            if(fullPath.isRoot())
                return checkThis();

            ctx.server.getFileSystem(pPath.getParent(), (fs, rootPath, subPath) => {
                fs.isLocked(ctx, subPath, depth + 1, (e, locked) => {
                    if(e || locked)
                        return callback(e, locked);
                    
                    checkThis();
                })
            })
        })
    }

    /**
     * Serialize the file system based on the 'this.serializer()' value.
     */
    serializeAsync() : Promise<any>
    {
        return promisifyCall((cb) => this.serialize(cb))
    }

    /**
     * Serialize the file system based on the 'this.serializer()' value.
     * 
     * @param callback Returns the serialized data or an error.
     */
    serialize(callback : ReturnCallback<any>) : void
    {
        const serializer = this.serializer();
        if(!serializer)
            return callback();
        
        serializer.serialize(this, callback);
    }

    /**
     * Attach a listener to an event.
     * 
     * @param server Server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(server : WebDAVServer, event : FileSystemEvent, listener : (ctx : RequestContext, path : Path, data ?: any) => void) : this
    /**
     * Attach a listener to an event.
     * 
     * @param server Server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(server : WebDAVServer, event : string, listener : (ctx : RequestContext, path : Path, data ?: any) => void) : this
    /**
     * Attach a listener to an event.
     * 
     * @param ctx Context containing the server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(ctx : RequestContext, event : FileSystemEvent, listener : (ctx : RequestContext, path : Path, data ?: any) => void) : this
    /**
     * Attach a listener to an event.
     * 
     * @param ctx Context containing the server in which the event can happen.
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(ctx : RequestContext, event : string, listener : (ctx : RequestContext, path : Path, data ?: any) => void) : this
    on(ctx : RequestContext | WebDAVServer, event : FileSystemEvent, listener : (ctx : RequestContext, path : Path, data ?: any) => void) : this
    {
        const server = (ctx as any).events ? ctx as WebDAVServer : (ctx as RequestContext).server;
        server.on(event, (ctx, fs, path) => {
            if(fs === this)
                listener(ctx, path);
        })
        return this;
    }

    /**
     * Trigger an event.
     * 
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param path Path of the resource on which the event happened.
     */
    emit(event : string, ctx : RequestContext, path : Path | string, data ?: any) : void
    {
        ctx.server.emit(event, ctx, this, path, data);
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
