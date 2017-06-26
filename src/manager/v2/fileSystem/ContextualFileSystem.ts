import { AvailableLocksInfo, CopyInfo, CreateInfo, CreationDateInfo, DeleteInfo, DisplayNameInfo, ETagInfo, IContextInfo, LastModifiedDateInfo, LockManagerInfo, MimeTypeInfo, MoveInfo, OpenReadStreamInfo, OpenWriteStreamInfo, PropertyManagerInfo, ReadDirInfo, RenameInfo, SizeInfo, TypeInfo, WebNameInfo } from './ContextInfo'
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
import { ReturnCallback, SimpleCallback, Return2Callback, OpenWriteStreamMode, SubTree, ResourceType } from './CommonTypes'
import { FileSystemSerializer, ISerializableFileSystem } from './Serialization'
import { FileSystem } from './FileSystem'
import { Resource } from './Resource'
import { IPropertyManager } from './PropertyManager'
import { ILockManager } from './LockManager'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export class ContextualFileSystem implements ISerializableFileSystem
{
    constructor(public fs : FileSystem, public context : RequestContext)
    { }

    resource(path : Path) : Resource
    {
        return new Resource(path, this.fs, this.context);
    }

    delete(path : Path, callback : SimpleCallback) : void
    delete(path : Path, depth : number, callback : SimpleCallback) : void
    delete(path : Path, _depth : any, _callback ?: SimpleCallback) : void
    {
        this.fs.delete(this.context, path, _depth, _callback);
    }
    
    openWriteStream(path : Path, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path, _mode : any, _targetSource ?: any, _estimatedSize ?: any, _callback ?: Return2Callback<Writable, boolean>) : void
    {
        this.fs.openWriteStream(this.context, path, _mode, _targetSource, _estimatedSize, _callback);
    }

    openReadStream(path : Path, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path, targetSource : boolean, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path, targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path, _targetSource : any, _estimatedSize ?: any, _callback ?: ReturnCallback<Readable>) : void
    {
        this.fs.openReadStream(this.context, path, _targetSource, _estimatedSize, _callback);
    }
    
    copy(pathFrom : Path, pathTo : Path, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path, pathTo : Path, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path, pathTo : Path, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path, pathTo : Path, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path, pathTo : Path, _overwrite : any, _depth ?: any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.copy(this.context, pathFrom, pathTo, _overwrite, _depth, _callback);
    }

    mimeType(path : Path, callback : ReturnCallback<string>) : void
    mimeType(path : Path, targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(path : Path, _targetSource : any, _callback ?: ReturnCallback<string>) : void
    {
        this.fs.mimeType(this.context, path, _targetSource, _callback);
    }

    size(path : Path, callback : ReturnCallback<number>) : void
    size(path : Path, targetSource : boolean, callback : ReturnCallback<number>) : void
    size(path : Path, _targetSource : any, _callback ?: ReturnCallback<number>) : void
    {
        this.fs.size(this.context, path, _targetSource, _callback);
    }
    
    addSubTree(rootPath : Path, subTree : SubTree, callback : SimpleCallback)
    addSubTree(rootPath : Path, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(rootPath : Path, tree : any, callback : SimpleCallback)
    {
        this.fs.size(this.context, rootPath, tree, callback);
    }

    create(path : Path, type : ResourceType, callback : SimpleCallback) : void
    create(path : Path, type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(path : Path, type : ResourceType, _createIntermediates : any, _callback ?: SimpleCallback) : void
    {
        this.fs.create(this.context, path, type, _createIntermediates, _callback);
    }
    etag(path : Path, callback : ReturnCallback<string>) : void
    {
        this.fs.etag(this.context, path, callback);
    }
    move(pathFrom : Path, pathTo : Path, callback : ReturnCallback<boolean>) : void
    move(pathFrom : Path, pathTo : Path, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(pathFrom : Path, pathTo : Path, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.move(this.context, pathFrom, pathTo, _overwrite, _callback);
    }
    rename(pathFrom : Path, newName : string, callback : ReturnCallback<boolean>) : void
    rename(pathFrom : Path, newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(pathFrom : Path, newName : string, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.rename(this.context, pathFrom, newName, _overwrite, _callback);
    }
    availableLocks(path : Path, callback : ReturnCallback<LockKind[]>) : void
    {
        this.fs.availableLocks(this.context, path, callback);
    }
    lockManager(path : Path, callback : ReturnCallback<ILockManager>) : void
    {
        this.fs.lockManager(this.context, path, callback);
    }
    propertyManager(path : Path, callback : ReturnCallback<IPropertyManager>) : void
    {
        this.fs.propertyManager(this.context, path, callback);
    }
    readDir(path : Path, callback : ReturnCallback<string[]>) : void
    readDir(path : Path, retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(path : Path, _retrieveExternalFiles : any, _callback ?: ReturnCallback<string[]>) : void
    {
        this.fs.readDir(this.context, path, _retrieveExternalFiles, _callback);
    }
    creationDate(path : Path, callback : ReturnCallback<number>) : void
    {
        this.fs.creationDate(this.context, path, callback);
    }
    lastModifiedDate(path : Path, callback : ReturnCallback<number>) : void
    {
        this.fs.lastModifiedDate(this.context, path, callback);
    }
    webName(path : Path, callback : ReturnCallback<string>) : void
    {
        this.fs.webName(this.context, path, callback);
    }
    displayName(path : Path, callback : ReturnCallback<string>) : void
    {
        this.fs.displayName(this.context, path, callback);
    }
    type(path : Path, callback : ReturnCallback<ResourceType>) : void
    {
        this.fs.type(this.context, path, callback);
    }
    
    listDeepLocks(startPath : Path, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(startPath : Path, depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(startPath : Path, _depth : any, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        this.fs.listDeepLocks(this.context, startPath, _depth, _callback);
    }
    
    serializer() : FileSystemSerializer
    {
        return this.fs.serializer();
    }
    serialize(callback : (serializedData : any) => void) : void
    {
        this.fs.serialize(callback);
    }
}
