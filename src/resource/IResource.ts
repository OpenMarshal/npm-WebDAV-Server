import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../manager/FSManager'
import { XMLElement } from '../helper/XML'
import { LockKind } from './lock/LockKind'
import { LockType } from './lock/LockType'
import { Lock } from './lock/Lock'
import * as crypto from 'crypto'

export type SimpleCallback = (error : Error) => void
export type ReturnCallback<T> = (error : Error, data : T) => void
export type Return2Callback<T, Q> = (error : Error, x : T, y : Q) => void

export type ResourcePropertyValue = string | XMLElement | XMLElement[]

export class ResourceType
{
    static File = new ResourceType(true, false)
    static Directory = new ResourceType(false, true)

    static Hibrid = new ResourceType(true, true)
    static NoResource = new ResourceType(false, false)

    constructor(public isFile : boolean, public isDirectory : boolean)
    { }
}

export abstract class ETag
{
    static createETag(date : number | string) : string
    {
        return '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"';
    }
}

export interface IResource
{
    parent : IResource
    fsManager : FSManager

    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    delete(callback : SimpleCallback)
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    rename(newName : string, callback : Return2Callback<string, string>)

    // ****************************** Tests ****************************** //
    isSame(resource : IResource, callback : ReturnCallback<boolean>)
    isOnTheSameFSWith(resource : IResource, callback : ReturnCallback<boolean>)
    
    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    size(targetSource : boolean, callback : ReturnCallback<number>)
    
    // ****************************** Locks ****************************** //
    getLocks(callback : ReturnCallback<Lock[]>)
    setLock(lock : Lock, callback : SimpleCallback)
    removeLock(uuid : string, callback : ReturnCallback<boolean>)
    canLock(lockKind : LockKind, callback : ReturnCallback<boolean>)
    getAvailableLocks(callback : ReturnCallback<LockKind[]>)
    canRemoveLock(uuid : string, callback : ReturnCallback<boolean>)
    getLock(uuid : string, callback : ReturnCallback<Lock>)

    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    removeChild(resource : IResource, callback : SimpleCallback)
    getChildren(callback : ReturnCallback<IResource[]>)

    // ****************************** Properties ****************************** //
    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback)
    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>)
    removeProperty(name : string, callback : SimpleCallback)
    getProperties(callback : ReturnCallback<object>)
    
    // ****************************** Std meta-data ****************************** //
    creationDate(callback : ReturnCallback<number>)
    lastModifiedDate(callback : ReturnCallback<number>)
    webName(callback : ReturnCallback<string>)
    type(callback : ReturnCallback<ResourceType>)
}
