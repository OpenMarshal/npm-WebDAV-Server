import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, ReadableOptions } from 'stream'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../manager/FSManager'
import { Errors } from '../../Errors'
import * as mimeTypes from 'mime-types'

export class VirtualFileReadable extends Readable
{
    blockIndex : number

    constructor(public contents : Int8Array[], options ?: ReadableOptions)
    {
        super(options);

        this.blockIndex = -1;
    }

    _read(size : number)
    {
        while(true)
        {
            ++this.blockIndex;

            if(this.blockIndex >= this.contents.length)
            {
                this.push(null);
                break;
            }

            if(!this.push(this.contents[this.blockIndex]))
                break;
        }
    }
}

export class VirtualFile extends VirtualResource
{
    content : Int8Array[]
    len : number

    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(name, parent, fsManager);

        this.content = [];
        this.len = 0;
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.File)
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        this.content.push(data);
        this.len += data.length;
        this.updateLastModified();
        callback(null);
    }
    write(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        this.content = [ data ];
        this.len = data.length;
        this.updateLastModified();
        callback(null);
    }
    read(targetSource : boolean, callback : ReturnCallback<Int8Array|Readable>)
    {
        callback(null, new VirtualFileReadable(this.content));
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.lookup(this.name);
        callback(null, mt ? mt as string : 'application/octet-stream');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback(null, this.len);
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
