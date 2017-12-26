import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType, ResourcePropertyValue } from '../IResource'
import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { StandardResource } from './StandardResource'
import { RequestContext, MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { LockScope } from '../lock/LockScope'
import { Workflow } from '../../../helper/Workflow'
import { LockType } from '../lock/LockType'
import { LockKind } from '../lock/LockKind'
import { LockBag } from '../lock/LockBag'
import { Errors } from '../../../Errors'
import { Lock } from '../lock/Lock'
import * as mimeTypes from 'mime-types'

export interface IWrappableResource<T> extends IResource
{
    parent : IResource
    fsManager : FSManager

    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    delete(callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    rename(newName : string, callback : Return2Callback<string, string>, ctx ?: RequestContext, data ?: T)
    
    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>, finalSize ?: number, ctx ?: RequestContext, data ?: T)
    read(targetSource : boolean, callback : ReturnCallback<Readable>, ctx ?: RequestContext, data ?: T)
    mimeType(targetSource : boolean, callback : ReturnCallback<string>, ctx ?: RequestContext, data ?: T)
    size(targetSource : boolean, callback : ReturnCallback<number>, ctx ?: RequestContext, data ?: T)
    
    // ****************************** Locks ****************************** //
    getLocks(callback : ReturnCallback<Lock[]>, ctx ?: RequestContext, data ?: T)
    setLock(lock : Lock, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    removeLock(uuid : string, callback : ReturnCallback<boolean>, ctx ?: RequestContext, data ?: T)
    getAvailableLocks(callback : ReturnCallback<LockKind[]>, ctx ?: RequestContext, data ?: T)
    getLock(uuid : string, callback : ReturnCallback<Lock>, ctx ?: RequestContext, data ?: T)

    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    removeChild(resource : IResource, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    getChildren(callback : ReturnCallback<IResource[]>, ctx ?: RequestContext, data ?: T)

    // ****************************** Properties ****************************** //
    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>, ctx ?: RequestContext, data ?: T)
    removeProperty(name : string, callback : SimpleCallback, ctx ?: RequestContext, data ?: T)
    getProperties(callback : ReturnCallback<object>, ctx ?: RequestContext, data ?: T)
    
    // ****************************** Std meta-data ****************************** //
    creationDate(callback : ReturnCallback<number>, ctx ?: RequestContext, data ?: T)
    lastModifiedDate(callback : ReturnCallback<number>, ctx ?: RequestContext, data ?: T)
    webName(callback : ReturnCallback<string>, ctx ?: RequestContext, data ?: T)
    displayName?(callback : ReturnCallback<string>, ctx ?: RequestContext, data ?: T)
    type(callback : ReturnCallback<ResourceType>, ctx ?: RequestContext, data ?: T)
    
    // ****************************** Gateway ****************************** //
    gateway?(arg : RequestContext, path : FSPath, callback : (error : Error, resource ?: IResource) => void)
}

export class SimpleResourceWrapper<T> implements IResource
{
    get fsManager()
    {
        return this.resource.fsManager;
    }
    set fsManager(fsManager : FSManager)
    {
        this.resource.fsManager = fsManager;
    }

    get parent()
    {
        return this.resource.parent;
    }
    set parent(parent : IResource)
    {
        this.resource.parent = parent;
    }

    get _isWrapper()
    {
        return true;
    }
    
    constructor(public resource : IWrappableResource<T>, public data ?: T)
    { }

    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback) { this._invoke('create', [ callback ]); }
    delete(callback : SimpleCallback) { this._invoke('delete', [ callback ]); }
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback) { this._invoke('moveTo', [ parent, newName, overwrite, callback ]); }
    rename(newName : string, callback : Return2Callback<string, string>) { this._invoke('rename', [ newName, callback ]); }
    
    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>, finalSize ?: number) { this._invoke('write', [ targetSource, callback, finalSize ]); }
    read(targetSource : boolean, callback : ReturnCallback<Readable>) { this._invoke('read', [ targetSource, callback ]); }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>) { this._invoke('mimeType', [ targetSource, callback ]); }
    size(targetSource : boolean, callback : ReturnCallback<number>) { this._invoke('size', [ targetSource, callback ]); }
    
    // ****************************** Locks ****************************** //
    getLocks(callback : ReturnCallback<Lock[]>) { this._invoke('getLocks', [ callback ]); }
    setLock(lock : Lock, callback : SimpleCallback) { this._invoke('setLock', [ lock, callback ]); }
    removeLock(uuid : string, callback : ReturnCallback<boolean>) { this._invoke('removeLock', [ uuid, callback ]); }
    getAvailableLocks(callback : ReturnCallback<LockKind[]>) { this._invoke('getAvailableLocks', [ callback ]); }
    getLock(uuid : string, callback : ReturnCallback<Lock>) { this._invoke('getLock', [ uuid, callback ]); }

    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback) { this._invoke('addChild', [ resource, callback ]); }
    removeChild(resource : IResource, callback : SimpleCallback) { this._invoke('removeChild', [ resource, callback ]); }
    getChildren(callback : ReturnCallback<IResource[]>) { this._invoke('getChildren', [ callback ]); }

    // ****************************** Properties ****************************** //
    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback) { this._invoke('setProperty', [ name, value, callback ]); }
    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>) { this._invoke('getProperty', [ name, callback ]); }
    removeProperty(name : string, callback : SimpleCallback) { this._invoke('removeProperty', [ name, callback ]); }
    getProperties(callback : ReturnCallback<object>) { this._invoke('getProperties', [ callback ]); }
    
    // ****************************** Std meta-data ****************************** //
    creationDate(callback : ReturnCallback<number>) { this._invoke('creationDate', [ callback ]); }
    lastModifiedDate(callback : ReturnCallback<number>) { this._invoke('lastModifiedDate', [ callback ]); }
    webName(callback : ReturnCallback<string>) { this._invoke('webName', [ callback ]); }
    type(callback : ReturnCallback<ResourceType>) { this._invoke('type', [ callback ]); }
    displayName(callback : ReturnCallback<string>)
    {
        if(this.resource.displayName)
            this._invoke('displayName', [ callback ]);
        else
            this._invoke('webName', [ callback ]);
    }
    
    // ****************************** Gateway ****************************** //
    get gateway()
    {
        return this.resource.gateway;
    }

    protected _invoke(name : string, args : any[])
    {
        args.push(this.data);
        (this.resource[name] as Function).call(this.resource, args);
    }
}

export class ResourceWrapper<T> extends SimpleResourceWrapper<T>
{
    constructor(resource : IWrappableResource<T>, ctx ?: RequestContext, data ?: T)
    {
        super(resource, data);

        for(const name in resource)
            if(name !== 'gateway' && name !== '_invoke' && name !== '_isWrapper' && name !== 'parent' && name !== 'fsManager')
                this[name] = resource[name];
    }

    protected _invoke(name : string, args : any[])
    {
        args.push(this.data);
        (this.resource[name] as Function).call(this, args);
    }
}
