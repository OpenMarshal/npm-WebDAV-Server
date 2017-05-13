import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { PhysicalFSManager } from '../../manager/PhysicalFSManager'
import { FSManager, FSPath } from '../../manager/FSManager'
import { StandardResource } from '../std/StandardResource'
import * as path from 'path'
import * as fs from 'fs'

export abstract class PhysicalResource extends StandardResource
{
    realPath : string
    
    constructor(realPath : string, parent ?: IResource, fsManager ?: FSManager)
    {
        if(!fsManager)
            if(parent && parent.fsManager && parent.fsManager.constructor === PhysicalFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = PhysicalFSManager.instance();

        super(parent, fsManager);

        this.realPath = path.resolve(realPath);
    }
    
    // ****************************** Actions ****************************** //
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    moveTo(to : FSPath, callback : Return2Callback<FSPath, FSPath>)
    {
        callback(new Error('Not implemented yet.'), null, null);
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        const newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, (e) => {
            if(e)
            {
                callback(e, null, null);
                return;
            }
            const oldName = path.basename(this.realPath);
            this.realPath = newPath;
            this.updateLastModified();
            callback(e, oldName, newName);
        })
    }
    
    // ****************************** Std meta-data ****************************** //
    webName(callback : ReturnCallback<string>)
    {
        callback(null, path.basename(this.realPath));
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
