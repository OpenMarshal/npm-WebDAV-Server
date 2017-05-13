import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType } from '../IResource'
import { FSManager, FSPath } from '../../manager/FSManager'
import { LockScope } from '../lock/LockScope'
import { LockType } from '../lock/LockType'
import { LockKind } from '../lock/LockKind'
import { LockBag } from '../lock/LockBag'
import { forAll } from './ResourceChildren'
import { Lock } from '../lock/Lock'

export abstract class StandardResource implements IResource
{
    static sizeOfSubFiles(resource : IResource, callback : ReturnCallback<number>)
    {
        resource.getChildren((e, children) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            let size = 0;
            forAll<IResource>(children, (child, cb) => {
                child.size((e, s) => {
                    if(e)
                        size += s;
                    cb(null);
                })
            }, () => callback(null, size), (e) => callback(e, null));
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
    getLocks(lockKind : LockKind, callback : ReturnCallback<Lock[]>)
    {
        callback(null, this.lockBag.getLocks(lockKind));
    }
    setLock(lock : Lock, callback : SimpleCallback)
    {
        const locked = this.lockBag.setLock(lock);
        callback(locked ? null : new Error('Can\'t lock the resource.'));
    }
    removeLock(uuid : string, owner : string, callback : ReturnCallback<boolean>)
    {
        this.getChildren((e, children) => {
            if(e)
            {
                callback(e, false);
                return;
            }

            let nb = children.length + 1;
            children.forEach((child) => {
                child.canRemoveLock(uuid, owner, go);
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
                    this.lockBag.removeLock(uuid, owner);
                    this.updateLastModified();
                    callback(null, true);
                }
            }
        })
    }
    canRemoveLock(uuid : string, owner : string, callback : ReturnCallback<boolean>)
    {
        callback(null, this.lockBag.canRemoveLock(uuid, owner));
    }
    canLock(lockKind : LockKind, callback : ReturnCallback<boolean>)
    {
        callback(null, this.lockBag.canLock(lockKind));
    }
    
    // ****************************** Properties ****************************** //
    setProperty(name : string, value : string, callback : SimpleCallback)
    {
        this.properties[name] = value;
        this.updateLastModified();
        callback(null);
    }
    getProperty(name : string, callback : ReturnCallback<string>)
    {
        const value = this.properties[name];
        if(value === undefined)
            callback(new Error('No property with such name.'), null);
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
    abstract moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    abstract rename(newName : string, callback : Return2Callback<string, string>)

    // ****************************** Content ****************************** //
    abstract append(data : Int8Array, callback : SimpleCallback)
    abstract write(data : Int8Array, callback : SimpleCallback)
    abstract read(callback : ReturnCallback<Int8Array>)
    abstract mimeType(callback : ReturnCallback<string>)
    abstract size(callback : ReturnCallback<number>)
    
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
