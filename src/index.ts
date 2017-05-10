

export interface IUser
{
}

export interface SimpleCallback
{
    (error : Error) : void;
}
export interface ReturnCallback<T>
{
    (error : Error, data : T) : void;
}
export interface Return2Callback<T, Q>
{
    (error : Error, x : T, y : Q) : void;
}

export enum LockType
{
    Write
}
export enum LockScope
{
    Shared,
    Esclusive
}
export class LockKind
{
    constructor(
        public scope : LockScope,
        public type : LockType,
        public timeout : number = 60)
    { }

    isSimilar(lockKind : LockKind)
    {
        return this.scope === lockKind.scope && this.type === lockKind.type;
    }
}
export class Lock
{
    lockKind : LockKind
    expirationDate : number
    owner : string
    uuid : string

    constructor(lockKind : LockKind, owner : string)
    {
        this.expirationDate = Date.now() + lockKind.timeout;
        this.lockKind = lockKind;
        this.owner = owner;
        this.uuid = Lock.generateUUID(this.expirationDate);
    }

    static generateUUID(expirationDate : number) : string
    {
        var rnd1 = Math.ceil(Math.random() * 0x3FFF) + 0x8000;
        var rnd2 = Math.ceil(Math.random() * 0xFFFFFFFF);

        function pad(value : number, nb : number)
        {
            var str = Math.ceil(value).toString(16);
            while(str.length < nb)
                str = '0' + str;
            return str;
        }

        var uuid = 'urn:uuid:';
        // time_low
        uuid += pad(expirationDate & 0xFFFFFFFF, 8);
        // time_mid
        uuid += '-' + pad((expirationDate >> 32) & 0xFFFF, 4);
        // time_hi_and_version
        uuid += '-' + pad(((expirationDate >> (32 + 16)) & 0x0FFF) + 0x1000, 4);
        // clock_seq_hi_and_reserved
        uuid += '-' + pad((rnd1 >> 16) & 0xFF, 2);
        // clock_seq_low
        uuid += pad(rnd1 & 0xFF, 2);
        // node
        uuid += '-' + pad(rnd2, 12);

        return uuid;
    }

    expired() : boolean
    {
        return Date.now() > this.expirationDate;
    }
}

export class FSPath
{

}

export interface IResource
{
    parent : IResource
    fsManager : FSManager

    //****************************** Actions ******************************//
    create(callback : SimpleCallback)
    delete(callback : SimpleCallback)
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    rename(newName : string, callback : Return2Callback<string, string>)

    //****************************** Tests ******************************//
    isSame(resource : IResource, callback : ReturnCallback<boolean>)
    isOnTheSameFSWith(resource : IResource, callback : ReturnCallback<boolean>)
    
    //****************************** Content ******************************//
    append(data : Int8Array, callback : SimpleCallback)
    write(data : Int8Array, callback : SimpleCallback)
    read(callback : ReturnCallback<Int8Array>)
    mimeType(callback : ReturnCallback<string>)
    size(callback : ReturnCallback<number>)
    
    //****************************** Locks ******************************//
    getLocks(lockKind : LockKind, callback : ReturnCallback<Array<Lock>>)
    setLock(lock : Lock, callback : SimpleCallback)
    removeLock(uuid : string, owner : string, callback : ReturnCallback<boolean>)
    canLock(lockKind : LockKind, callback : ReturnCallback<boolean>)
    getAvailableLocks(callback : ReturnCallback<Array<LockKind>>)
    canRemoveLock(uuid : string, owner : string, callback : ReturnCallback<boolean>)

    //****************************** Children ******************************//
    addChild(resource : IResource, callback : SimpleCallback)
    removeChild(resource : IResource, callback : SimpleCallback)
    getChildren(callback : ReturnCallback<Array<IResource>>)

    //****************************** Properties ******************************//
    setProperty(name : string, value : string, callback : SimpleCallback)
    getProperty(name : string, callback : ReturnCallback<string>)
    removeProperty(name : string, callback : SimpleCallback)
    
    //****************************** Std meta-data ******************************//
    creationDate(callback : ReturnCallback<number | Date>)
    lastModifiedDate(callback : ReturnCallback<number | Date>)
    webName(callback : ReturnCallback<string>)
}

export interface FSManager
{
    load();
    save();
}

export class LockBag
{
    locks : Array<Lock>

    private notExpired(l : Lock)
    {
        return !l.expired();
    }
    private cleanLocks()
    {
        this.locks = this.locks.filter(this.notExpired);
    }

    getLocks(lockKind : LockKind) : Array<Lock>
    {
        this.cleanLocks();
        return this.locks.filter(l => l.lockKind.isSimilar(lockKind))
    }

    setLock(lock : Lock) : boolean
    {
        if(!this.canLock(lock.lockKind))
            return false;
        
        this.locks.push(lock);
        return true;
    }

    removeLock(uuid : string, owner : string) : void
    {
        this.locks = this.locks.filter(l => this.notExpired(l) && (l.uuid !== uuid || l.owner !== owner));
    }
    canRemoveLock(uuid : string, owner : string) : boolean
    {
        this.cleanLocks();
        return this.locks.some(l => l.uuid === uuid && l.owner !== owner);
    }

    canLock(lockKind : LockKind) : boolean
    {
        this.cleanLocks();
        return !this.locks.some(l => {
            return l.lockKind.scope === LockScope.Esclusive;
        });
    }
}

function forAll<T>(array : Array<T>, itemFn : (item : T, callback : (e) => void) => void, onAllAndSuccess : () => void, onError : (e) => void) : void
{
    var nb = array.length + 1;
    var error = null;

    array.forEach(child => {
        if(error)
            return;
        itemFn(child, e => {
            if(e)
            {
                error = e;
                onError(error);
            }
            else
                go();
        });
    })
    go();
    
    function go()
    {
        --nb;
        if(nb === 0 || error)
            return;
        
        onAllAndSuccess();
    }
}

import * as path from 'path'
import * as fs from 'fs'

export abstract class StdandardResource implements IResource
{
    properties : Object
    fsManager : FSManager
    lockBag : LockBag
    parent : IResource
    dateCreation : number
    dateLastModified : number
    
    constructor(parent : IResource, fsManager : FSManager)
    {
        this.dateCreation = Date.now();
        this.properties = new Object();
        this.fsManager = fsManager;
        this.lockBag = new LockBag();
        this.parent = parent;
        
        this.dateLastModified = this.dateCreation;
    }

    protected updateLastModified()
    {
        this.dateLastModified = Date.now();
    }

    protected removeFromParent(callback : SimpleCallback)
    {
        if(this.parent)
            this.parent.removeChild(this, callback);
        else
            callback(null);
    }

    //****************************** Tests ******************************//
    isSame(resource : IResource, callback : ReturnCallback<boolean>)
    {
        callback(null, resource === (this as Object));
    }
    isOnTheSameFSWith(resource : IResource, callback : ReturnCallback<boolean>)
    {
        callback(null, resource.fsManager === this.fsManager);
    }

    //****************************** Locks ******************************//
    getAvailableLocks(callback : ReturnCallback<Array<LockKind>>)
    {
        callback(null, [
            new LockKind(LockScope.Esclusive, LockType.Write),
            new LockKind(LockScope.Shared, LockType.Write)
        ])
    }
    getLocks(lockKind : LockKind, callback : ReturnCallback<Array<Lock>>)
    {
        callback(null, this.lockBag.getLocks(lockKind));
    }
    setLock(lock : Lock, callback : SimpleCallback)
    {
        var locked = this.lockBag.setLock(lock);
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

            var nb = children.length + 1;
            children.forEach(child => {
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
    
    //****************************** Properties ******************************//
    setProperty(name : string, value : string, callback : SimpleCallback)
    {
        this.properties[name] = value;
        this.updateLastModified();
        callback(null);
    }
    getProperty(name : string, callback : ReturnCallback<string>)
    {
        var value = this.properties[name];
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
    
    //****************************** Actions ******************************//
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    abstract moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    abstract rename(newName : string, callback : Return2Callback<string, string>)

    //****************************** Content ******************************//
    abstract append(data : Int8Array, callback : SimpleCallback)
    abstract write(data : Int8Array, callback : SimpleCallback)
    abstract read(callback : ReturnCallback<Int8Array>)
    abstract mimeType(callback : ReturnCallback<string>)
    abstract size(callback : ReturnCallback<number>)
    
    //****************************** Std meta-data ******************************//
    creationDate(callback : ReturnCallback<number | Date>)
    {
        callback(null, this.dateCreation);
    }
    lastModifiedDate(callback : ReturnCallback<number | Date>)
    {
        callback(null, this.dateLastModified);
    }
    abstract webName(callback : ReturnCallback<string>)
    
    //****************************** Children ******************************//
    abstract addChild(resource : IResource, callback : SimpleCallback)
    abstract removeChild(resource : IResource, callback : SimpleCallback)
    abstract getChildren(callback : ReturnCallback<Array<IResource>>)
}

export abstract class PhysicalResource extends StdandardResource
{
    realPath : string
    
    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(parent, fsManager);

        this.realPath = path.resolve(realPath);
    }
    
    //****************************** Actions ******************************//
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    {
        callback(new Error('Not implemented yet.'), null, null);
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        var newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, e => {
            if(e)
            {
                callback(e, null, null);
                return;
            }
            var oldName = path.dirname(this.realPath);
            this.realPath = newPath;
            this.updateLastModified();
            callback(e, oldName, newName);
        })
    }
    
    //****************************** Std meta-data ******************************//
    webName(callback : ReturnCallback<string>)
    {
        callback(null, path.dirname(this.realPath));
    }

    //****************************** Content ******************************//
    abstract append(data : Int8Array, callback : SimpleCallback)
    abstract write(data : Int8Array, callback : SimpleCallback)
    abstract read(callback : ReturnCallback<Int8Array>)
    abstract mimeType(callback : ReturnCallback<string>)
    abstract size(callback : ReturnCallback<number>)
    
    //****************************** Children ******************************//
    abstract addChild(resource : IResource, callback : SimpleCallback)
    abstract removeChild(resource : IResource, callback : SimpleCallback)
    abstract getChildren(callback : ReturnCallback<Array<IResource>>)
}

export class PhysicalFolder extends PhysicalResource
{
    children : ResourceChildren

    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(realPath, parent, fsManager);

        this.children = new ResourceChildren();
    }
    
    //****************************** Actions ******************************//
    create(callback : SimpleCallback)
    {
        fs.mkdir(this.realPath, callback)
    }
    delete(callback : SimpleCallback)
    {
        this.getChildren((e, children) => {
            if(e)
            {
                callback(e);
                return;
            }

            forAll<IResource>(children, (child, cb) => {
                child.delete(cb);
            }, () => {
                fs.unlink(this.realPath, e => {
                    if(e)
                        callback(e);
                    else
                        this.removeFromParent(callback);
                });
            }, callback)
        })
    }

    //****************************** Content ******************************//
    append(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        callback(new Error("Invalid operation"), null);
    }
    mimeType(callback : ReturnCallback<string>)
    {
        callback(null, 'directory');
    }
    size(callback : ReturnCallback<number>)
    {
        this.getChildren((e, children) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            var size = 0;
            forAll<IResource>(children, (child, cb) => {
                child.size((e, s) => {
                    if(e)
                        size += s;
                    cb(null);
                })
            }, () => callback(null, size), e => callback(e, null));
        })
    }
    
    //****************************** Children ******************************//
    addChild(resource : IResource, callback : SimpleCallback)
    {
        this.children.add(resource, callback);
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        this.children.remove(resource, callback);
    }
    getChildren(callback : ReturnCallback<Array<IResource>>)
    {
        callback(null, this.children.children);
    }
}

export class ResourceChildren
{
    children : Array<IResource>

    add(resource : IResource, callback : SimpleCallback)
    {
        if(this.children.some(c => c === resource))
        {
            callback(new Error("The resource already exists."));
            return;
        }

        this.children.push(resource);
        callback(null);
    }
    remove(resource : IResource, callback : SimpleCallback)
    {
        var index = this.children.indexOf(resource);
        if(index === -1)
        {
            callback(new Error("Can't find the resource."));
            return;
        }

        this.children = this.children.splice(index, 1);
        callback(null);
    }
}

import * as mimeTypes from 'mime-types'

export abstract class PhysicalFile extends PhysicalResource
{
    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(realPath, parent, fsManager);
    }
    
    //****************************** Actions ******************************//
    create(callback : SimpleCallback)
    {
        fs.open(this.realPath, fs.constants.O_CREAT, (e, fd) => {
            if(e)
                callback(e);
            else
                fs.close(fd, e => {
                    callback(e);
                });
        })
    }
    delete(callback : SimpleCallback)
    {
        fs.unlink(this.realPath, e => {
            if(e)
                callback(e);
            else
                this.removeFromParent(callback);
        })
    }

    //****************************** Content ******************************//
    append(data : Int8Array, callback : SimpleCallback)
    {
        fs.appendFile(this.realPath, data, callback);
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        fs.writeFile(this.realPath, data, callback);
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        fs.readFile(this.realPath, callback);
    }
    mimeType(callback : ReturnCallback<string>)
    {
        var mt = mimeTypes.lookup(this.realPath);
        callback(mt ? null : new Error("application/octet-stream"), mt as string);
    }
    size(callback : ReturnCallback<number>)
    {
        fs.stat(this.realPath, (e, s) => callback(e, s ? s.size : null))
    }
    
    //****************************** Children ******************************//
    addChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    getChildren(callback : ReturnCallback<Array<IResource>>)
    {
        callback(new Error("Invalid operation"), null);
    }
}

import * as http from 'http'
import * as url from 'url'
/*
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888;
*/

export class MethodCallArgs
{
    constructor(
        public uri : string,
        public request : http.IncomingMessage,
        public response : http.ServerResponse,
        public resource : IResource,
        public callback : () => void
    ) { }
}

export interface WebDAVRequest
{
    (arg : MethodCallArgs, callback : () => void) : void
}


export class WebDAVServer
{
    protected beforeManagers : Array<WebDAVRequest>
    protected afterManagers : Array<WebDAVRequest>
    protected methods : Object;

    constructor()
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = new Object();

        this.method('GET', (arg, callback) => {
            arg.response.write('<html><body>ok</body></html>');
            callback();
        });
    }

    start(port : number = 1900)
    {
        http.createServer((req : http.IncomingMessage, res : http.ServerResponse) =>
        {
            var method : WebDAVRequest = this.methods[this.normalizeMethodName(req.method)];
            if(method)
            {
                var base : MethodCallArgs = this.createMethodCallArgs(req, res)
                this.invokeBeforeRequest(base, () => {
                    method(base, () =>
                    {
                        res.end();
                        this.invokeAfterRequest(base, null)
                    });
                })
            }
        }).listen(port);
    }

    protected createMethodCallArgs(req : http.IncomingMessage, res : http.ServerResponse) : MethodCallArgs
    {
        var uri = url.parse(req.url).pathname;
        
        return new MethodCallArgs(
            uri,
            req,
            res,
            null,
            null
        )
    }

    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    method(name : string, manager : WebDAVRequest)
    {
        this.methods[this.normalizeMethodName(name)] = manager;
    }

    beforeRequest(manager : WebDAVRequest)
    {
        this.beforeManagers.push(manager);
    }
    afterRequest(manager : WebDAVRequest)
    {
        this.afterManagers.push(manager);
    }

    protected invokeBARequest(collection : Array<WebDAVRequest>, base : MethodCallArgs, callback)
    {
        if(collection.length === 0)
        {
            if(callback)
                callback();
            return;
        }

        base.callback = next;
        var nb = collection.length + 1;
        
        function next()
        {
            --nb;
            if(nb === 0)
            {
                if(callback)
                    callback();
            }
            else
                collection[collection.length - nb](base, next);
        }
        next();
    }
    protected invokeBeforeRequest(base : MethodCallArgs, callback)
    {
        this.invokeBARequest(this.beforeManagers, base, callback);
    }
    protected invokeAfterRequest(base : MethodCallArgs, callback)
    {
        this.invokeBARequest(this.afterManagers, base, callback);
    }
}

var serv = new WebDAVServer();
serv.beforeRequest((arg, next) => {
    console.log(arg.uri);
    next();
})
serv.afterRequest((arg, next) => {
    console.log('after');
    next();
})
serv.start(1900);
