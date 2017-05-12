import { StandardResource, IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from './Resource'
import { ResourceChildren, forAll } from './ResourceChildren'
import { FSManager, FSPath } from '../manager/FSManager'
import { VirtualFSManager } from '../manager/VirtualFSManager'

export class RootResource extends StandardResource
{
    children : ResourceChildren

    constructor()
    {
        super(null, new VirtualFSManager());

        this.children = new ResourceChildren();
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        callback(new Error('Illegal operation.'))
    }
    delete(callback : SimpleCallback)
    {
        callback(new Error('Illegal operation.'))
    }
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    {
        callback(new Error('Illegal operation.'), null, null)
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        callback(new Error('Illegal operation.'), null, null)
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
    append(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Illegal operation.'))
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Illegal operation.'))
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        callback(new Error('Illegal operation.'), null)
    }
    mimeType(callback : ReturnCallback<string>)
    {
        callback(null, 'directory')
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
