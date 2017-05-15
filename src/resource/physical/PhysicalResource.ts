import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { PhysicalFSManager } from '../../manager/PhysicalFSManager'
import { FSManager, FSPath } from '../../manager/FSManager'
import { StandardResource } from '../std/StandardResource'
import * as path from 'path'
import * as fs from 'fs'

export abstract class PhysicalResource extends StandardResource
{
    realPath : string
    name : string
    
    constructor(realPath : string, parent ?: IResource, fsManager ?: FSManager)
    {
        if(!fsManager)
            if(parent && parent.fsManager && parent.fsManager.constructor === PhysicalFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = PhysicalFSManager.instance();

        super(parent, fsManager);

        this.realPath = path.resolve(realPath);
        this.name = path.basename(this.realPath);
    }
    
    // ****************************** Actions ****************************** //
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    moveTo(parent : IResource, newName : string, override : boolean, callback : SimpleCallback)
    {
        if(parent === this.parent)
        {
            this.rename(newName, (e, oldName, newName) => {
                callback(e);
            })
            return;
        }

        const oldName = this.name;
        this.name = newName;
        this.removeFromParent((e) => {
            if(e)
            {
                this.name = oldName;
                callback(e);
            }
            else
                parent.addChild(this, (e) => {
                    callback(e);
                })
        })
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
            this.name = newName;
            this.updateLastModified();
            callback(null, oldName, newName);
        })
    }
    
    // ****************************** Std meta-data ****************************** //
    webName(callback : ReturnCallback<string>)
    {
        callback(null, path.basename(this.name));
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
