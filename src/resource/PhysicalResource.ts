import { StandardResource, IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from './Resource'
import { ResourceChildren, forAll } from './ResourceChildren'
import { FSManager, FSPath } from '../manager/FSManager'
import * as mimeTypes from 'mime-types'
import * as path from 'path'
import * as fs from 'fs'

export abstract class PhysicalResource extends StandardResource
{
    realPath : string
    
    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(parent, fsManager);

        this.realPath = path.resolve(realPath);
    }
    
    // ****************************** Actions ****************************** //
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    {
        callback(new Error('Not implemented yet.'), null, null);
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        let newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, (e) => {
            if(e)
            {
                callback(e, null, null);
                return;
            }
            let oldName = path.basename(this.realPath);
            this.realPath = newPath;
            this.updateLastModified();
            callback(e, oldName, newName);
        })
    }
    
    // ****************************** Std meta-data ****************************** //
    webName(callback : ReturnCallback<string>)
    {
        callback(null, path.basename(this.realPath));
    }
    abstract type(callback : ReturnCallback<ResourceType>)

    // ****************************** Content ****************************** //
    abstract append(data : Int8Array, callback : SimpleCallback)
    abstract write(data : Int8Array, callback : SimpleCallback)
    abstract read(callback : ReturnCallback<Int8Array>)
    abstract mimeType(callback : ReturnCallback<string>)
    abstract size(callback : ReturnCallback<number>)
    
    // ****************************** Children ****************************** //
    abstract addChild(resource : IResource, callback : SimpleCallback)
    abstract removeChild(resource : IResource, callback : SimpleCallback)
    abstract getChildren(callback : ReturnCallback<IResource[]>)
}

export class PhysicalFolder extends PhysicalResource
{
    children : ResourceChildren

    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(realPath, parent, fsManager);

        this.children = new ResourceChildren();
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.Directory)
    }
    
    // ****************************** Actions ****************************** //
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
                fs.unlink(this.realPath, (e) => {
                    if(e)
                        callback(e);
                    else
                        this.removeFromParent(callback);
                });
            }, callback)
        })
    }

    // ****************************** Content ****************************** //
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
        StandardResource.sizeOfSubFiles(this, callback);
    }
    
    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    {
        this.children.add(resource, callback);
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        this.children.remove(resource, callback);
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(null, this.children.children);
    }
}

export class PhysicalFile extends PhysicalResource
{
    constructor(realPath : string, parent : IResource, fsManager : FSManager)
    {
        super(realPath, parent, fsManager);
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.File)
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        fs.open(this.realPath, fs.constants.O_CREAT, (e, fd) => {
            if(e)
                callback(e);
            else
                fs.close(fd, (e) => {
                    callback(e);
                });
        })
    }
    delete(callback : SimpleCallback)
    {
        fs.unlink(this.realPath, (e) => {
            if(e)
                callback(e);
            else
                this.removeFromParent(callback);
        })
    }

    // ****************************** Content ****************************** //
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
        const mt = mimeTypes.lookup(this.realPath);
        callback(mt ? null : new Error("application/octet-stream"), mt as string);
    }
    size(callback : ReturnCallback<number>)
    {
        fs.stat(this.realPath, (e, s) => callback(e, s ? s.size : null))
    }
    
    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error("Invalid operation"));
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(new Error("Invalid operation"), null);
    }
}
