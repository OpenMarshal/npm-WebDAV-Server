import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType, ResourcePropertyValue } from '../IResource'
import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../../manager/FSManager'
import { LockScope } from '../lock/LockScope'
import { LockType } from '../lock/LockType'
import { LockKind } from '../lock/LockKind'
import { LockBag } from '../lock/LockBag'
import { Errors } from '../../Errors'
import { Lock } from '../lock/Lock'

export abstract class StandardResource implements IResource
{
    static sizeOfSubFiles(resource : IResource, targetSource : boolean, callback : ReturnCallback<number>)
    {
        resource.getChildren((e, children) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            if(children.length === 0)
            {
                callback(null, 0);
                return;
            }

            let size = 0;
            let nb = children.length;
            function go(e, s)
            {
                if(nb <= 0)
                    return;
                if(e)
                {
                    nb = -1;
                    callback(e, size);
                    return;
                }
                size += s;
                --nb;
                if(nb === 0)
                    callback(null, size);
            }

            children.forEach((c) => c.size(targetSource, go))
        })
    }

    properties : object
    fsManager : FSManager
    lockBag : LockBag
    parent : IResource
    dateCreation : number
    dateLastModified : number
    
    constructor(parent : IResource, fsManager : FSManager)
    {
        this.dateCreation = Date.now();
        this.properties = {};
        this.fsManager = fsManager;
        this.lockBag = new LockBag();
        this.parent = parent;
        
        this.dateLastModified = this.dateCreation;
    }

    // ****************************** Tests ****************************** //
    isSame(resource : IResource, callback : ReturnCallback<boolean>)
    {
        callback(null, resource === (this as object));
    }
    isOnTheSameFSWith(resource : IResource, callback : ReturnCallback<boolean>)
    {
        callback(null, resource.fsManager === this.fsManager);
    }

    // ****************************** Locks ****************************** //
    getAvailableLocks(callback : ReturnCallback<LockKind[]>)
    {
        callback(null, [
            new LockKind(LockScope.Exclusive, LockType.Write),
            new LockKind(LockScope.Shared, LockType.Write)
        ])
    }
    getLocks(callback : ReturnCallback<Lock[]>)
    {
        callback(null, this.lockBag.getLocks());
    }
    setLock(lock : Lock, callback : SimpleCallback)
    {
        const locked = this.lockBag.setLock(lock);
        this.updateLastModified();
        callback(locked ? null : Errors.CannotLockResource);
    }
    removeLock(uuid : string, callback : ReturnCallback<boolean>)
    {
        this.lockBag.removeLock(uuid);
        this.updateLastModified();
        callback(null, true);
        /*
        this.getChildren((e, children) => {
            if(e)
            {
                callback(e, false);
                return;
            }

            let nb = children.length + 1;
            children.forEach((child) => {
                child.canRemoveLock(uuid, go);
            });
            go(null, true);

            function go(e, can)
            {
                if(e)
                {
                    nb = -1;
                    callback(e, false);
                    return;
                }
                if(!can)
                {
                    nb = -1;
                    callback(null, false);
                    return;
                }
                --nb;
                if(nb === 0)
                {
                    this.lockBag.removeLock(uuid);
                    this.updateLastModified();
                    callback(null, true);
                }
            }
        })*/
    }
    canRemoveLock(uuid : string, callback : ReturnCallback<boolean>)
    {
        callback(null, this.lockBag.canRemoveLock(uuid));
    }
    canLock(lockKind : LockKind, callback : ReturnCallback<boolean>)
    {
        callback(null, this.lockBag.canLock(lockKind));
    }
    getLock(uuid : string, callback : ReturnCallback<Lock>)
    {
        callback(null, this.lockBag.getLock(uuid));
    }
    
    // ****************************** Properties ****************************** //
    setProperty(name : string, value : ResourcePropertyValue, callback : SimpleCallback)
    {
        this.properties[name] = value;
        this.updateLastModified();
        callback(null);
    }
    getProperty(name : string, callback : ReturnCallback<ResourcePropertyValue>)
    {
        const value = this.properties[name];
        if(value === undefined)
            callback(Errors.PropertyNotFound, null);
        else
            callback(null, value);
    }
    removeProperty(name : string, callback : SimpleCallback)
    {
        delete this.properties[name];
        this.updateLastModified();
        callback(null);
    }
    getProperties(callback : ReturnCallback<object>)
    {
        callback(null, this.properties);
    }
    
    // ****************************** Actions ****************************** //
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    abstract moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    abstract rename(newName : string, callback : Return2Callback<string, string>)

    // ****************************** Content ****************************** //
    abstract write(targetSource : boolean, callback : ReturnCallback<Writable>)
    abstract read(targetSource : boolean, callback : ReturnCallback<Readable>)
    abstract mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    abstract size(targetSource : boolean, callback : ReturnCallback<number>)
    
    // ****************************** Std meta-data ****************************** //
    creationDate(callback : ReturnCallback<number>)
    {
        callback(null, this.dateCreation);
    }
    lastModifiedDate(callback : ReturnCallback<number>)
    {
        callback(null, this.dateLastModified);
    }
    abstract webName(callback : ReturnCallback<string>)
    abstract type(callback : ReturnCallback<ResourceType>)
    
    // ****************************** Children ****************************** //
    abstract addChild(resource : IResource, callback : SimpleCallback)
    abstract removeChild(resource : IResource, callback : SimpleCallback)
    abstract getChildren(callback : ReturnCallback<IResource[]>)

    protected updateLastModified()
    {
        this.dateLastModified = Date.now();
    }

    protected removeFromParent(callback : SimpleCallback)
    {
        const parent = this.parent;
        if(parent)
            parent.removeChild(this, (e) => {
                if(e)
                {
                    callback(e)
                    return;
                }
                
                if(this.parent === parent) // this.parent didn't change
                    this.parent = null;
                callback(null);
            });
        else
            callback(null);
    }
}
