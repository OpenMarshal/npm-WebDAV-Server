import { AvailableLocksInfo, CopyInfo, CreateInfo, CreationDateInfo, DeleteInfo, DisplayNameInfo, ETagInfo, IContextInfo, LastModifiedDateInfo, LockManagerInfo, MimeTypeInfo, MoveInfo, OpenReadStreamInfo, OpenWriteStreamInfo, PropertyManagerInfo, ReadDirInfo, RenameInfo, SizeInfo, TypeInfo, WebNameInfo } from './ContextInfo'
import { ReturnCallback, SimpleCallback, Return2Callback, OpenWriteStreamMode, SubTree, ResourceType } from './CommonTypes'
import { FileSystemSerializer, ISerializableFileSystem } from './Serialization'
import { FileSystem } from './FileSystem'
import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { XMLElement } from '../../../helper/XML'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import { IPropertyManager } from './PropertyManager'
import { ILockManager } from './LockManager'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export class Resource
{
    path : Path

    constructor(path : Path | string, public fs : FileSystem, public context : RequestContext)
    {
        this.path = new Path(path);
    }

    delete(callback : SimpleCallback) : void
    delete(depth : number, callback : SimpleCallback) : void
    delete(_depth : any, _callback ?: SimpleCallback) : void
    {
        this.fs.delete(this.context, this.path, _depth, _callback);
    }
    
    openWriteStream(callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(_mode : any, _targetSource ?: any, _estimatedSize ?: any, _callback ?: Return2Callback<Writable, boolean>) : void
    {
        this.fs.openWriteStream(this.context, this.path, _mode, _targetSource, _estimatedSize, _callback);
    }

    openReadStream(callback : ReturnCallback<Readable>) : void
    openReadStream(estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(targetSource : boolean, callback : ReturnCallback<Readable>) : void
    openReadStream(targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(_targetSource : any, _estimatedSize ?: any, _callback ?: ReturnCallback<Readable>) : void
    {
        this.fs.openReadStream(this.context, this.path, _targetSource, _estimatedSize, _callback);
    }
    
    copy(pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    copy(pathTo : Path | string, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    copy(pathTo : Path | string, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathTo : Path | string, _overwrite : any, _depth ?: any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.copy(this.context, this.path, pathTo, _overwrite, _depth, _callback);
    }

    mimeType(callback : ReturnCallback<string>) : void
    mimeType(targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(_targetSource : any, _callback ?: ReturnCallback<string>) : void
    {
        this.fs.mimeType(this.context, this.path, _targetSource, _callback);
    }

    size(callback : ReturnCallback<number>) : void
    size(targetSource : boolean, callback : ReturnCallback<number>) : void
    size(_targetSource : any, _callback ?: ReturnCallback<number>) : void
    {
        this.fs.size(this.context, this.path, _targetSource, _callback);
    }
    
    addSubTree(subTree : SubTree, callback : SimpleCallback)
    addSubTree(resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(tree : any, callback : SimpleCallback)
    {
        this.fs.addSubTree(this.context, this.path, tree, callback);
    }

    create(type : ResourceType, callback : SimpleCallback) : void
    create(type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(type : ResourceType, _createIntermediates : any, _callback ?: SimpleCallback) : void
    {
        this.fs.create(this.context, this.path, type, _createIntermediates, _callback);
    }
    etag(callback : ReturnCallback<string>) : void
    {
        this.fs.etag(this.context, this.path, callback);
    }
    move(pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    move(pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(pathTo : Path | string, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.move(this.context, this.path, pathTo, _overwrite, _callback);
    }
    rename(newName : string, callback : ReturnCallback<boolean>) : void
    rename(newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(newName : string, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.rename(this.context, this.path, newName, _overwrite, _callback);
    }
    availableLocks(callback : ReturnCallback<LockKind[]>) : void
    {
        this.fs.availableLocks(this.context, this.path, callback);
    }
    lockManager(callback : ReturnCallback<ILockManager>) : void
    {
        this.fs.lockManager(this.context, this.path, callback);
    }
    propertyManager(callback : ReturnCallback<IPropertyManager>) : void
    {
        this.fs.propertyManager(this.context, this.path, callback);
    }
    readDir(callback : ReturnCallback<string[]>) : void
    readDir(retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(_retrieveExternalFiles : any, _callback ?: ReturnCallback<string[]>) : void
    {
        this.fs.readDir(this.context, this.path, _retrieveExternalFiles, _callback);
    }
    creationDate(callback : ReturnCallback<number>) : void
    {
        this.fs.creationDate(this.context, this.path, callback);
    }
    lastModifiedDate(callback : ReturnCallback<number>) : void
    {
        this.fs.lastModifiedDate(this.context, this.path, callback);
    }
    webName(callback : ReturnCallback<string>) : void
    {
        this.fs.webName(this.context, this.path, callback);
    }
    displayName(callback : ReturnCallback<string>) : void
    {
        this.fs.displayName(this.context, this.path, callback);
    }
    type(callback : ReturnCallback<ResourceType>) : void
    {
        this.fs.type(this.context, this.path, callback);
    }
    
    listDeepLocks(callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(_depth : any, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        this.fs.listDeepLocks(this.context, this.path, _depth, _callback);
    }
}
