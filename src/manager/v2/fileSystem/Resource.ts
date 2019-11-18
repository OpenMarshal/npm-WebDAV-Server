import {
    ReturnCallback,
    SimpleCallback,
    Return2Callback,
    OpenWriteStreamMode,
    SubTree,
    ResourceType
} from './CommonTypes'
import { Readable, Writable } from 'stream'
import { IPropertyManager } from './PropertyManager'
import { RequestContext } from '../../../server/v2/RequestContext'
import { ILockManager, ILockManagerAsync } from './LockManager'
import { FileSystem } from './FileSystem'
import { LockKind } from '../../../resource/v2/lock/LockKind'
import { Lock } from '../../../resource/v2/lock/Lock'
import { Path } from '../Path'

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
    lockManager(callback : ReturnCallback<ILockManagerAsync>) : void
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
    
    isLocked(callback : ReturnCallback<boolean>)
    isLocked(depth : number, callback : ReturnCallback<boolean>)
    isLocked(_depth : any, _callback ?: ReturnCallback<boolean>)
    {
        this.fs.isLocked(this.context, this.path, _depth, _callback);
    }

    // Async methods
        
    deleteAsync() : Promise<void>
    deleteAsync(depth : number) : Promise<void>
    deleteAsync(_depth ?: any) : Promise<void>
    {
        return this.fs.deleteAsync(this.context, this.path, _depth);
    }
    
    openWriteStreamAsync() : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(targetSource : boolean) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(targetSource : boolean, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(mode : OpenWriteStreamMode) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(mode : OpenWriteStreamMode, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(mode : OpenWriteStreamMode, targetSource : boolean) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(mode : OpenWriteStreamMode, targetSource : boolean, estimatedSize : number) : Promise<{ stream : Writable, created : boolean }>
    openWriteStreamAsync(_mode ?: any, _targetSource ?: any, _estimatedSize ?: any) : Promise<{ stream : Writable, created : boolean }>
    {
        return this.fs.openWriteStreamAsync(this.context, this.path, _mode, _targetSource, _estimatedSize);
    }

    openReadStreamAsync() : Promise<Readable>
    openReadStreamAsync(estimatedSize : number) : Promise<Readable>
    openReadStreamAsync(targetSource : boolean) : Promise<Readable>
    openReadStreamAsync(targetSource : boolean, estimatedSize : number) : Promise<Readable>
    openReadStreamAsync(_targetSource ?: any, _estimatedSize ?: any) : Promise<Readable>
    {
        return this.fs.openReadStreamAsync(this.context, this.path, _targetSource, _estimatedSize);
    }
    
    copyAsync(pathTo : Path | string) : Promise<boolean>
    copyAsync(pathTo : Path | string, depth : number) : Promise<boolean>
    copyAsync(pathTo : Path | string, overwrite : boolean) : Promise<boolean>
    copyAsync(pathTo : Path | string, overwrite : boolean, depth : number) : Promise<boolean>
    copyAsync(pathTo : Path | string, _overwrite ?: any, _depth ?: any) : Promise<boolean>
    {
        return this.fs.copyAsync(this.context, this.path, pathTo, _overwrite, _depth);
    }

    mimeTypeAsync() : Promise<string>
    mimeTypeAsync(targetSource : boolean) : Promise<string>
    mimeTypeAsync(_targetSource ?: any) : Promise<string>
    {
        return this.fs.mimeTypeAsync(this.context, this.path, _targetSource);
    }

    sizeAsync() : Promise<number>
    sizeAsync(targetSource : boolean) : Promise<number>
    sizeAsync(_targetSource ?: any) : Promise<number>
    {
        return this.fs.sizeAsync(this.context, this.path, _targetSource);
    }
    
    addSubTreeAsync(subTree : SubTree, callback : SimpleCallback)
    addSubTreeAsync(resourceType : ResourceType, callback : SimpleCallback)
    addSubTreeAsync(tree : any, callback : SimpleCallback)
    {
        return this.fs.addSubTreeAsync(this.context, this.path, tree);
    }

    createAsync(type : ResourceType) : Promise<void>
    createAsync(type : ResourceType, createIntermediates : boolean) : Promise<void>
    createAsync(type : ResourceType, _createIntermediates ?: any) : Promise<void>
    {
        return this.fs.createAsync(this.context, this.path, type, _createIntermediates);
    }
    etagAsync() : Promise<string>
    {
        return this.fs.etagAsync(this.context, this.path);
    }
    moveAsync(pathTo : Path | string) : Promise<boolean>
    moveAsync(pathTo : Path | string, overwrite : boolean) : Promise<boolean>
    moveAsync(pathTo : Path | string, _overwrite ?: any) : Promise<boolean>
    {
        return this.fs.moveAsync(this.context, this.path, pathTo, _overwrite);
    }
    renameAsync(newName : string) : Promise<boolean>
    renameAsync(newName : string, overwrite : boolean) : Promise<boolean>
    renameAsync(newName : string, _overwrite ?: any) : Promise<boolean>
    {
        return this.fs.renameAsync(this.context, this.path, newName, _overwrite);
    }
    availableLocksAsync() : Promise<LockKind[]>
    {
        return this.fs.availableLocksAsync(this.context, this.path);
    }
    lockManagerAsync() : Promise<ILockManagerAsync>
    {
        return this.fs.lockManagerAsync(this.context, this.path);
    }
    propertyManagerAsync() : Promise<IPropertyManager>
    {
        return this.fs.propertyManagerAsync(this.context, this.path);
    }
    readDirAsync() : Promise<string[]>
    readDirAsync(retrieveExternalFiles : boolean) : Promise<string[]>
    readDirAsync(_retrieveExternalFiles ?: any) : Promise<string[]>
    {
        return this.fs.readDirAsync(this.context, this.path, _retrieveExternalFiles);
    }
    creationDateAsync() : Promise<number>
    {
        return this.fs.creationDateAsync(this.context, this.path);
    }
    lastModifiedDateAsync() : Promise<number>
    {
        return this.fs.lastModifiedDateAsync(this.context, this.path);
    }
    webNameAsync() : Promise<string>
    {
        return this.fs.webNameAsync(this.context, this.path);
    }
    displayNameAsync() : Promise<string>
    {
        return this.fs.displayNameAsync(this.context, this.path);
    }
    typeAsync() : Promise<ResourceType>
    {
        return this.fs.typeAsync(this.context, this.path);
    }
    
    listDeepLocksAsync() : Promise<{ [path : string] : Lock[] }>
    listDeepLocksAsync(depth : number) : Promise<{ [path : string] : Lock[] }>
    listDeepLocksAsync(_depth ?: any) : Promise<{ [path : string] : Lock[] }>
    {
        return this.fs.listDeepLocksAsync(this.context, this.path, _depth);
    }
    
    isLockedAsync() : Promise<boolean>
    isLockedAsync(depth : number) : Promise<boolean>
    isLockedAsync(_depth ?: any) : Promise<boolean>
    {
        return this.fs.isLockedAsync(this.context, this.path, _depth);
    }
}
