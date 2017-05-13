import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { FSManager, FSPath } from '../../manager/FSManager'
import { VirtualFSManager } from '../../manager/VirtualFSManager'
import { StandardResource } from '../std/StandardResource'

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
