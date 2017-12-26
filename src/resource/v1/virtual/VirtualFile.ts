import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'
import * as mimeTypes from 'mime-types'

export class VirtualFileReadable extends Readable
{
    blockIndex : number

    constructor(public contents : Int8Array[])
    {
        super();

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

export class VirtualFileWritable extends Writable
{
    constructor(public contents : Int8Array[])
    {
        super(null);
    }

    _write(chunk : Buffer | string | any, encoding : string, callback : (error : Error) => void)
    {
        this.contents.push(chunk);
        callback(null);
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
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    {
        const content = [];
        const stream = new VirtualFileWritable(content);
        stream.on('finish', () => {
            this.content = content;
            this.len = content.map((c) => c.length).reduce((s, n) => s + n, 0);
            this.updateLastModified();
        })
        callback(null, stream);
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        callback(null, new VirtualFileReadable(this.content));
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.contentType(this.name);
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
