import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { PhysicalFSManager } from '../../../manager/v1/PhysicalFSManager'
import { StandardResource } from '../std/StandardResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'
import * as path from 'path'
import * as fs from 'fs'

export abstract class PhysicalResource extends StandardResource
{
    removeOnUnavailableSource : boolean
    realPath : string
    name : string
    
    constructor(realPath : string, parent ?: IResource, fsManager ?: FSManager)
    {
        if(!fsManager)
            if(parent && parent.fsManager && parent.fsManager.constructor === PhysicalFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = new PhysicalFSManager();

        super(parent, fsManager);

        this.removeOnUnavailableSource = false;
        this.deleteOnMoved = false;
        this.realPath = path.resolve(realPath);
        this.name = path.basename(this.realPath);
    }

    protected manageError(error : Error) : Error
    {
        if(!this.removeOnUnavailableSource || !error)
            return error;
        
        this.removeFromParent((e) => { });

        return Errors.MustIgnore;
    }
    protected wrapCallback<T extends Function>(callback : T) : T
    {
        return (((e, arg1, arg2) => callback(this.manageError(e), arg1, arg2)) as any) as T;
    }
    
    // ****************************** Actions ****************************** //
    abstract create(callback : SimpleCallback)
    abstract delete(callback : SimpleCallback)
    moveTo(parent : IResource, newName : string, overwrite : boolean, callback : SimpleCallback)
    {
        callback = this.wrapCallback(callback);

        const pRealPath = (parent as any).realPath;
        if(!(parent.fsManager && this.fsManager && parent.fsManager.uid === this.fsManager.uid && pRealPath))
        {
            StandardResource.standardMoveByCopy(this, parent, newName, overwrite, this.deleteOnMoved, callback);
            return;
        }
        
        const newRealPath = path.join(pRealPath, newName);
        fs.rename(this.realPath, newRealPath, (e) => {
            if(e)
            {
                callback(e);
                return;
            }

            this.realPath = newRealPath;
            this.name = path.basename(this.realPath);

            this.removeFromParent((e) => {
                if(e)
                {
                    callback(e);
                    return;
                }

                this.addToParent(parent, callback);
            })
        })
    }
    rename(newName : string, callback : Return2Callback<string, string>)
    {
        callback = this.wrapCallback(callback);

        const newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, (e) => {
            if(e)
            {
                callback(this.manageError(e), null, null);
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
        callback = this.wrapCallback(callback);

        callback(null, path.basename(this.name));
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
