import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType, ResourcePropertyValue } from '../IResource'
import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { LockScope } from '../lock/LockScope'
import { Workflow } from '../../../helper/Workflow'
import { LockType } from '../lock/LockType'
import { LockKind } from '../lock/LockKind'
import { LockBag } from '../lock/LockBag'
import { Errors } from '../../../Errors'
import { Lock } from '../lock/Lock'
import * as mimeTypes from 'mime-types'

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

            new Workflow()
                .each(children, (child, cb) => {
                    child.size(targetSource, cb);
                })
                .error((e) => callback(e, 0))
                .done((sizes) => callback(null, sizes.reduce((o, s) => o + s, 0)))
        })
    }

    dateLastModified : number
    deleteOnMoved : boolean
    dateCreation : number
    properties : object
    fsManager : FSManager
    lockBag : LockBag
    parent : IResource
    
    constructor(parent : IResource, fsManager : FSManager)
    {
        this.deleteOnMoved = true;
        this.dateCreation = Date.now();
        this.properties = {};
        this.fsManager = fsManager;
        this.lockBag = new LockBag();
        this.parent = parent;
        
        this.dateLastModified = this.dateCreation;
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
    abstract rename(newName : string, callback : Return2Callback<string, string>)
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    {
        StandardResource.standardMoveByCopy(this, parent, newName, overwrite, this.deleteOnMoved, callback);
    }

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
    
    // ****************************** Gateway ****************************** //
    gateway?(arg : MethodCallArgs, path : FSPath, callback : (error : Error, resource ?: IResource) => void);

    protected updateLastModified()
    {
        this.dateLastModified = Date.now();
    }

    protected removeFromParent(callback : SimpleCallback)
    {
        StandardResource.standardRemoveFromParent(this, callback);
    }
    protected addToParent(parent : IResource, callback : SimpleCallback)
    {
        StandardResource.standardAddToParent(this, parent, callback);
    }
    public static standardRemoveFromParent(resource : IResource, callback : SimpleCallback)
    {
        const parent = resource.parent;
        if(parent)
            parent.removeChild(resource, (e) => {
                if(!e && resource.parent === parent) // resource.parent didn't change
                    resource.parent = null;
                callback(e);
            });
        else
            callback(null);
    }
    public static standardAddToParent(resource : IResource, parent : IResource, callback : SimpleCallback)
    {
        parent.addChild(resource, (e) => {
            if(!e)
                resource.parent = parent;
            
            callback(e);
        });
    }
    public static standardFindChildren(parent : IResource, predicate : (resource : IResource, callback : (error : Error, isMatching ?: boolean) => void) => void, callback : ReturnCallback<IResource[]>)
    {
        parent.getChildren((e, children) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            new Workflow()
                .each(children, (child, cb) => {
                    predicate(child, (e, isMatching) => cb(e, isMatching ? child : null));
                })
                .error((e) => callback(e, null))
                .done((conflictingChildren) => callback(null, conflictingChildren.filter((c) => !!c)));
        })
    }
    public static standardFindChildByName(parent : IResource, name : string, callback : ReturnCallback<IResource>)
    {
        this.standardFindChildren(parent, (r, cb) => r.webName((e, rname) => {
            if(e)
                cb(e);
            else if(name === rname)
                cb(null, true);
            else
                cb(null, false);
        }), (e, rs) => {
            if(e)
                callback(e, null);
            else if(rs.length > 0)
                callback(null, rs[0])
            else
                callback(Errors.ResourceNotFound, null);
        })
    }
    public static standardMoveByCopy(resource : IResource, parent : IResource, newName : string, overwrite : boolean, deleteSource : boolean, callback : ReturnCallback<IResource>)
    {
        StandardResource.standardFindChildByName(parent, newName, (e, r) => {
            if(e === Errors.ResourceNotFound)
                copy();
            else if(e)
                callback(e, null);
            else if(!overwrite)
                callback(Errors.ResourceAlreadyExists, null);
            else
                r.delete((e) => {
                    if(e)
                        callback(e, null);
                    else
                        copy();
                })
        })

        function copy()
        {
            resource.type((e, type) => {
                if(e)
                {
                    callback(e, null);
                    return;
                }

                const destination = parent.fsManager.newResource(null, newName, type, parent);
                destination.create((e) => {
                    if(e)
                    {
                        callback(e, null);
                        return;
                    }

                    parent.addChild(destination, (e) => {
                        if(e)
                        {
                            callback(e, null);
                            return;
                        }

                        if(type.isDirectory)
                            copyDir(destination);
                        else
                            copyFile(destination);
                    })
                });
            })
        }

        function copyProperties(destination : IResource, callback : SimpleCallback)
        {
            resource.getProperties((e, props) => {
                if(e)
                {
                    callback(e);
                    return;
                }

                new Workflow()
                    .each(Object.keys(props), (key, cb) => destination.setProperty(key, props[key], cb))
                    .error(callback)
                    .done(() => callback(null));
            })
        }
        function copyLocks(destination : IResource, callback : SimpleCallback)
        {
            resource.getLocks((e, locks) => {
                if(e === Errors.MustIgnore)
                {
                    callback(null);
                    return;
                }

                if(e)
                {
                    callback(e);
                    return;
                }

                new Workflow()
                    .each(locks, (lock, cb) => destination.setLock(lock, cb))
                    .error(callback)
                    .done(() => callback(null));
            })
        }
        function finalizeCopy(destination)
        {
            copyProperties(destination, (e) => {
                if(e)
                    callback(e, null);
                else
                    copyLocks(destination, (e) => {
                        if(e)
                            callback(e, null)
                        else if(deleteSource)
                            resource.delete((e) => callback(e, destination));
                        else
                            resource.parent.removeChild(resource, (e) => callback(e, destination));
                    });
            })
        }

        function copyDir(destination : IResource)
        {
            resource.getChildren((e, children) => {
                if(e)
                {
                    callback(e, null);
                    return;
                }

                new Workflow()
                    .each(children, (child, cb) => child.webName((e, name) => {
                        if(e)
                            cb(e);
                        else
                            child.moveTo(destination, name, overwrite, cb);
                    }))
                    .error((e) => callback(e, null))
                    .done(() => finalizeCopy(destination));
            })
        }

        function copyFile(destination : IResource)
        {
            resource.read(true, (e, rStream) => {
                if(e)
                {
                    callback(e, null);
                    return;
                }

                destination.write(true, (e, wStream) => {
                    if(e)
                    {
                        callback(e, null);
                        return;
                    }

                    rStream.pipe(wStream);
                    wStream.on('error', callback);
                    wStream.on('finish', () => finalizeCopy(destination));
                })
            })
        }
    }

    public static standardMoveTo(resource : IResource, parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    {
        StandardResource.standardMoveByCopy(resource, parent, newName, overwrite, true, callback);
    }

    /**
     * @deprecated Prefer calling 'standardMoveByCopy(...)' instead to avoid compatibility issue between file systems.
     */
    public static standardMoveWithoutCopy(resource : IResource, parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    {
        StandardResource.standardFindChildByName(parent, newName, (e, r) => {
            if(e === Errors.ResourceNotFound)
                move();
            else if(e)
                callback(e);
            else if(!overwrite)
                callback(Errors.ResourceAlreadyExists);
            else
                r.delete((e) => {
                    if(e)
                        callback(e);
                    else
                        move();
                })
        })

        function move()
        {
            if(parent === resource.parent)
            {
                resource.rename(newName, (e, oldName, newName) => {
                    callback(e);
                })
                return;
            }

            StandardResource.standardRemoveFromParent(resource, (e) => {
                if(e)
                {
                    callback(e);
                    return;
                }
                
                resource.webName((e, name) => {
                    if(e || name === newName)
                    {
                        parent.addChild(resource, (e) => {
                            callback(e);
                        })
                        return;
                    }

                    resource.rename(newName, (e, oldName, newName) => {
                        if(e)
                            callback(e);
                        else
                            parent.addChild(resource, (e) => {
                                callback(e);
                            })
                    })
                })
            })
        }
    }

    public static standardMimeType(resource : IResource, targetSource : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(resource : IResource, targetSource : boolean, useWebName : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(resource : IResource, targetSource : boolean, defaultMimeType : string, callback : ReturnCallback<string>)
    public static standardMimeType(resource : IResource, targetSource : boolean, defaultMimeType : string, useWebName : boolean, callback : ReturnCallback<string>)
    public static standardMimeType(resource : IResource, targetSource : boolean, _defaultMimeType : boolean | string | ReturnCallback<string>, _useWebName ?: boolean | ReturnCallback<string>, _callback ?: ReturnCallback<string>)
    {
        let callback;
        let useWebName = false;
        let defaultMimeType = 'application/octet-stream';

        if(_defaultMimeType.constructor === Function)
        {
            callback = _defaultMimeType as ReturnCallback<string>;
        }
        else if(_defaultMimeType.constructor === Boolean)
        {
            callback = _useWebName as ReturnCallback<string>;
            if(_defaultMimeType !== undefined && _defaultMimeType !== null)
                useWebName = _defaultMimeType as boolean;
        }
        else
        {
            callback = _callback as ReturnCallback<string>;
            if(_useWebName !== undefined && _useWebName !== null)
                useWebName = _useWebName as boolean;
            if(_defaultMimeType !== undefined && _defaultMimeType !== null)
                defaultMimeType = _defaultMimeType as string;
        }

        resource.type((e, type) => {
            if(e)
                callback(e, null);
            else if(type.isFile)
            {
                const fn = !useWebName && resource.displayName ? resource.displayName : resource.webName;
                fn((e, name) => {
                    if(e)
                        callback(e, null);
                    else
                    {
                        const mt = mimeTypes.contentType(name);
                        callback(null, mt ? mt as string : defaultMimeType);
                    }
                })
            }
            else
                callback(Errors.NoMimeTypeForAFolder, null);
        })
    }
}
