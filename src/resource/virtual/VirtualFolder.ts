import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { StandardResource } from '../std/StandardResource'
import { ResourceChildren } from '../std/ResourceChildren'
import { VirtualResource } from './VirtualResource'
import { FSManager } from '../../manager/FSManager'

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
