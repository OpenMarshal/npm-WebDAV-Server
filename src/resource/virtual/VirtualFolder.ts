import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, ReadableOptions } from 'stream'
import { StandardResource } from '../std/StandardResource'
import { ResourceChildren } from '../std/ResourceChildren'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../manager/FSManager'
import { Errors } from '../../Errors'

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
    append(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    write(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    read(targetSource : boolean, callback : ReturnCallback<Int8Array|Readable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback(null, 'directory');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        StandardResource.sizeOfSubFiles(this, targetSource, callback);
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
