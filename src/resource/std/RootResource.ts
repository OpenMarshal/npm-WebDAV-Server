import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { StandardResource } from './StandardResource'
import { ResourceChildren } from './ResourceChildren'
import { RootFSManager } from '../../manager/RootFSManager'
import { FSPath } from '../../manager/FSManager'
import { Errors } from '../../Errors'

export class RootResource extends StandardResource
{
    children : ResourceChildren

    constructor()
    {
        super(null, new RootFSManager());

        this.children = new ResourceChildren();
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation)
    }
    delete(callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation)
    }
    moveTo(parent : IResource, newName : string, override : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation)
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        callback(Errors.InvalidOperation, null, null)
    }
    
    // ****************************** Std meta-data ****************************** //
    webName(callback : ReturnCallback<string>)
    {
        callback(null, '')
    }
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.Directory)
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation)
    }
    write(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation)
    }
    read(targetSource : boolean, callback : ReturnCallback<Int8Array>)
    {
        callback(Errors.InvalidOperation, null)
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback(null, 'directory')
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
