import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../manager/FSManager'
import * as mimeTypes from 'mime-types'

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

    // ****************************** Content ****************************** //
    append(data : Int8Array, callback : SimpleCallback)
    {
        const newContent = new Int8Array(this.content.length + data.length)

        for(let i = 0; i < this.content.length; ++i)
            newContent[i] = this.content[i];
        for(let i = 0; i < data.length; ++i)
            newContent[i + this.content.length] = data[i];

        this.content = newContent;
        this.updateLastModified();
        callback(null);
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        this.content = data;
        this.updateLastModified();
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
