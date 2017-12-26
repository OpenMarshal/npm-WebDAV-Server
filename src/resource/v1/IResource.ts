import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../../manager/v1/FSManager'
import { StandardResource } from './std/StandardResource'
import { RequestContext } from '../../server/v1/MethodCallArgs'
import { WorkflowUnique } from '../../helper/Workflow'
import { XMLElement } from 'xml-js-builder'
import { LockKind } from './lock/LockKind'
import { LockType } from './lock/LockType'
import { Errors } from '../../Errors'
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
    create(callback : SimpleCallback, arg ?: RequestContext)
    delete(callback : SimpleCallback, arg ?: RequestContext)
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback, arg ?: RequestContext)
    rename(newName : string, callback : Return2Callback<string, string>, arg ?: RequestContext)
    
    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>, finalSize ?: number, arg ?: RequestContext)
    read(targetSource : boolean, callback : ReturnCallback<Readable>, arg ?: RequestContext)
    mimeType(targetSource : boolean, callback : ReturnCallback<string>, arg ?: RequestContext)
    size(targetSource : boolean, callback : ReturnCallback<number>, arg ?: RequestContext)
    
    // ****************************** Locks ****************************** //
    getLocks(callback : ReturnCallback<Lock[]>, arg ?: RequestContext)
    setLock(lock : Lock, callback : SimpleCallback, arg ?: RequestContext)
    removeLock(uuid : string, callback : ReturnCallback<boolean>, arg ?: RequestContext)
    getAvailableLocks(callback : ReturnCallback<LockKind[]>, arg ?: RequestContext)
    getLock(uuid : string, callback : ReturnCallback<Lock>, arg ?: RequestContext)

    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback, arg ?: RequestContext)
    removeChild(resource : IResource, callback : SimpleCallback, arg ?: RequestContext)
    getChildren(callback : ReturnCallback<IResource[]>, arg ?: RequestContext)

    // ****************************** Properties ****************************** //
    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback, arg ?: RequestContext)
    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>, arg ?: RequestContext)
    removeProperty(name : string, callback : SimpleCallback, arg ?: RequestContext)
    getProperties(callback : ReturnCallback<object>, arg ?: RequestContext)
    
    // ****************************** Std meta-data ****************************** //
    creationDate(callback : ReturnCallback<number>, arg ?: RequestContext)
    lastModifiedDate(callback : ReturnCallback<number>, arg ?: RequestContext)
    webName(callback : ReturnCallback<string>, arg ?: RequestContext)
    displayName?(callback : ReturnCallback<string>, arg ?: RequestContext)
    type(callback : ReturnCallback<ResourceType>, arg ?: RequestContext)
    
    // ****************************** Gateway ****************************** //
    gateway?(arg : RequestContext, path : FSPath, callback : (error : Error, resource ?: IResource) => void)
}
