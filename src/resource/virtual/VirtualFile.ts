import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../manager/FSManager'
import { Errors } from '../../Errors'
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
    append(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
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
    write(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        this.content = data;
        this.updateLastModified();
        callback(null);
    }
    read(targetSource : boolean, callback : ReturnCallback<Int8Array>)
    {
        callback(null, this.content);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.lookup(this.name);
        callback(null, mt ? mt as string : 'application/octet-stream');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback(null, this.content.length);
    }
    
    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(Errors.InvalidOperation, null);
    }
}
