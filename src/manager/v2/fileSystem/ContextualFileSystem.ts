import { ReturnCallback, SimpleCallback, Return2Callback, OpenWriteStreamMode, SubTree, ResourceType } from './CommonTypes'
import { FileSystemSerializer, ISerializableFileSystem } from './Serialization'
import { Readable, Writable } from 'stream'
import { IPropertyManager } from './PropertyManager'
import { RequestContext } from '../../../server/v2/RequestContext'
import { ILockManager } from './LockManager'
import { FileSystem } from './FileSystem'
import { Resource } from './Resource'
import { LockKind } from '../../../resource/v2/lock/LockKind'
import { Lock } from '../../../resource/v2/lock/Lock'
import { Path } from '../Path'

export class ContextualFileSystem implements ISerializableFileSystem
{
    constructor(public fs : FileSystem, public context : RequestContext)
    { }

    resource(path : Path | string) : Resource
    {
        return new Resource(path, this.fs, this.context);
    }

    delete(path : Path | string, callback : SimpleCallback) : void
    delete(path : Path | string, depth : number, callback : SimpleCallback) : void
    delete(path : Path | string, _depth : any, _callback ?: SimpleCallback) : void
    {
        this.fs.delete(this.context, path, _depth, _callback);
    }
    
    openWriteStream(path : Path | string, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, mode : OpenWriteStreamMode, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, mode : OpenWriteStreamMode, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number, callback : Return2Callback<Writable, boolean>) : void
    openWriteStream(path : Path | string, _mode : any, _targetSource ?: any, _estimatedSize ?: any, _callback ?: Return2Callback<Writable, boolean>) : void
    {
        this.fs.openWriteStream(this.context, path, _mode, _targetSource, _estimatedSize, _callback);
    }

    openReadStream(path : Path | string, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path | string, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path | string, targetSource : boolean, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path | string, targetSource : boolean, estimatedSize : number, callback : ReturnCallback<Readable>) : void
    openReadStream(path : Path | string, _targetSource : any, _estimatedSize ?: any, _callback ?: ReturnCallback<Readable>) : void
    {
        this.fs.openReadStream(this.context, path, _targetSource, _estimatedSize, _callback);
    }
    
    copy(pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path | string, pathTo : Path | string, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, depth : number, callback : ReturnCallback<boolean>) : void
    copy(pathFrom : Path | string, pathTo : Path | string, _overwrite : any, _depth ?: any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.copy(this.context, pathFrom, pathTo, _overwrite, _depth, _callback);
    }

    mimeType(path : Path | string, callback : ReturnCallback<string>) : void
    mimeType(path : Path | string, targetSource : boolean, callback : ReturnCallback<string>) : void
    mimeType(path : Path | string, _targetSource : any, _callback ?: ReturnCallback<string>) : void
    {
        this.fs.mimeType(this.context, path, _targetSource, _callback);
    }

    size(path : Path | string, callback : ReturnCallback<number>) : void
    size(path : Path | string, targetSource : boolean, callback : ReturnCallback<number>) : void
    size(path : Path | string, _targetSource : any, _callback ?: ReturnCallback<number>) : void
    {
        this.fs.size(this.context, path, _targetSource, _callback);
    }
    
    addSubTree(rootPath : Path | string, subTree : SubTree, callback : SimpleCallback)
    addSubTree(rootPath : Path | string, resourceType : ResourceType, callback : SimpleCallback)
    addSubTree(rootPath : Path | string, tree : any, callback : SimpleCallback)
    {
        this.fs.size(this.context, rootPath, tree, callback);
    }

    create(path : Path | string, type : ResourceType, callback : SimpleCallback) : void
    create(path : Path | string, type : ResourceType, createIntermediates : boolean, callback : SimpleCallback) : void
    create(path : Path | string, type : ResourceType, _createIntermediates : any, _callback ?: SimpleCallback) : void
    {
        this.fs.create(this.context, path, type, _createIntermediates, _callback);
    }
    etag(path : Path | string, callback : ReturnCallback<string>) : void
    {
        this.fs.etag(this.context, path, callback);
    }
    move(pathFrom : Path | string, pathTo : Path | string, callback : ReturnCallback<boolean>) : void
    move(pathFrom : Path | string, pathTo : Path | string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    move(pathFrom : Path | string, pathTo : Path | string, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.move(this.context, pathFrom, pathTo, _overwrite, _callback);
    }
    rename(pathFrom : Path | string, newName : string, callback : ReturnCallback<boolean>) : void
    rename(pathFrom : Path | string, newName : string, overwrite : boolean, callback : ReturnCallback<boolean>) : void
    rename(pathFrom : Path | string, newName : string, _overwrite : any, _callback ?: ReturnCallback<boolean>) : void
    {
        this.fs.rename(this.context, pathFrom, newName, _overwrite, _callback);
    }
    availableLocks(path : Path | string, callback : ReturnCallback<LockKind[]>) : void
    {
        this.fs.availableLocks(this.context, path, callback);
    }
    lockManager(path : Path | string, callback : ReturnCallback<ILockManager>) : void
    {
        this.fs.lockManager(this.context, path, callback);
    }
    propertyManager(path : Path | string, callback : ReturnCallback<IPropertyManager>) : void
    {
        this.fs.propertyManager(this.context, path, callback);
    }
    readDir(path : Path | string, callback : ReturnCallback<string[]>) : void
    readDir(path : Path | string, retrieveExternalFiles : boolean, callback : ReturnCallback<string[]>) : void
    readDir(path : Path | string, _retrieveExternalFiles : any, _callback ?: ReturnCallback<string[]>) : void
    {
        this.fs.readDir(this.context, path, _retrieveExternalFiles, _callback);
    }
    creationDate(path : Path | string, callback : ReturnCallback<number>) : void
    {
        this.fs.creationDate(this.context, path, callback);
    }
    lastModifiedDate(path : Path | string, callback : ReturnCallback<number>) : void
    {
        this.fs.lastModifiedDate(this.context, path, callback);
    }
    webName(path : Path | string, callback : ReturnCallback<string>) : void
    {
        this.fs.webName(this.context, path, callback);
    }
    displayName(path : Path | string, callback : ReturnCallback<string>) : void
    {
        this.fs.displayName(this.context, path, callback);
    }
    type(path : Path | string, callback : ReturnCallback<ResourceType>) : void
    {
        this.fs.type(this.context, path, callback);
    }
    
    listDeepLocks(startPath : Path | string, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(startPath : Path | string, depth : number, callback : ReturnCallback<{ [path : string] : Lock[] }>)
    listDeepLocks(startPath : Path | string, _depth : any, _callback ?: ReturnCallback<{ [path : string] : Lock[] }>)
    {
        this.fs.listDeepLocks(this.context, startPath, _depth, _callback);
    }
    
    isLocked(path : Path | string, callback : ReturnCallback<boolean>)
    isLocked(path : Path | string, depth : number, callback : ReturnCallback<boolean>)
    isLocked(path : Path | string, _depth : any, _callback ?: ReturnCallback<boolean>)
    {
        this.fs.isLocked(this.context, path, _depth, _callback);
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
