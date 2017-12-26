import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { VirtualFSManager } from '../../../manager/v1/VirtualFSManager'
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
                fsManager = new VirtualFSManager();

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
    abstract write(targetSource : boolean, callback : ReturnCallback<Writable>)
    abstract read(targetSource : boolean, callback : ReturnCallback<Readable>)
    abstract mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    abstract size(targetSource : boolean, callback : ReturnCallback<number>)
    
    // ****************************** Children ****************************** //
    abstract addChild(resource : IResource, callback : SimpleCallback)
    abstract removeChild(resource : IResource, callback : SimpleCallback)
    abstract getChildren(callback : ReturnCallback<IResource[]>)
}
