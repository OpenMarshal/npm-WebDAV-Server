import { StandardResource, IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from './Resource'
import { ResourceChildren, forAll } from './ResourceChildren'
import { FSManager, FSPath } from '../manager/FSManager'
import { VirtualFSManager } from '../manager/VirtualFSManager'
import * as mimeTypes from 'mime-types'
import * as path from 'path'
import * as fs from 'fs'

export abstract class VirtualResource extends StandardResource
{
    name : string

    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        if(!fsManager)
            if(parent && parent.fsManager && parent.fsManager.constructor === VirtualFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = VirtualFSManager.instance();

        super(parent, fsManager);

        this.name = name;
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        callback(null);
    }
    delete(callback : SimpleCallback)
    {
        this.removeFromParent(callback);
    }
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    {
        callback(new Error('Not implemented yet.'), null, null);
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        const oldName = this.name;
        this.name = newName;
        callback(null, oldName, newName);
    }
    
    // ****************************** Std meta-data ****************************** //
    webName(callback : ReturnCallback<string>)
    {
        callback(null, this.name);
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

export class VirtualFolder extends VirtualResource
{
    children : ResourceChildren

    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(name, parent, fsManager);

        this.children = new ResourceChildren();
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.Directory)
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        callback(new Error('Invalid operation'), null);
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
        this.children.add(resource, (e) => {
            if(!e)
                resource.parent = this;
            callback(e);
        });
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

export class VirtualFile extends VirtualResource
{
    content : Int8Array

    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(name, parent, fsManager);

        this.content = new Buffer(0);
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.File)
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        callback(null);
    }
    delete(callback : SimpleCallback)
    {
        this.removeFromParent(callback);
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, callback : SimpleCallback)
    {
        const newContent = new Int8Array(this.content.length + data.length)

        for(let i = 0; i < this.content.length; ++i)
            newContent[i] = this.content[i];
        for(let i = 0; i < data.length; ++i)
            newContent[i + this.content.length] = data[i];

        this.content = newContent;
        callback(null);
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        this.content = data;
        callback(null);
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        callback(null, this.content);
    }
    mimeType(callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.lookup(this.name);
        callback(mt ? null : new Error('Unkown mime type'), mt as string);
    }
    size(callback : ReturnCallback<number>)
    {
        callback(null, this.content.length);
    }
    
    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(new Error('Invalid operation'), null);
    }
}
