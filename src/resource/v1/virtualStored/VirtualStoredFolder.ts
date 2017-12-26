import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { StandardResource } from '../std/StandardResource'
import { ResourceChildren } from '../std/ResourceChildren'
import { VirtualStoredResource } from './VirtualStoredResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'

export class VirtualStoredFolder extends VirtualStoredResource
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
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback(Errors.NoMimeTypeForAFolder, null);
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback(Errors.NoSizeForAFolder, null);
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
        this.children.remove(resource, (e) => {
            if(!e)
                resource.parent = null;
            callback(e);
        });
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(null, this.children.children);
    }
}
