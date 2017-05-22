import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { PhysicalResource } from './PhysicalResource'
import { FSManager } from '../../manager/FSManager'
import { Errors } from '../../Errors'
import * as mimeTypes from 'mime-types'
import * as fs from 'fs'

export class PhysicalFile extends PhysicalResource
{
    constructor(realPath : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(realPath, parent, fsManager);
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.File)
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        fs.open(this.realPath, fs.constants.O_CREAT, (e, fd) => {
            if(e)
                callback(e);
            else
                fs.close(fd, (e) => {
                    callback(e);
                });
        })
    }
    delete(callback : SimpleCallback)
    {
        fs.unlink(this.realPath, (e) => {
            if(e)
                callback(e);
            else
                this.removeFromParent(callback);
        })
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, callback : SimpleCallback)
    {
        fs.appendFile(this.realPath, data, (e) => {
            if(e)
                callback(e);
            else
            {
                this.updateLastModified();
                callback(null);
            }
        });
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        fs.writeFile(this.realPath, data, (e) => {
            if(e)
                callback(e);
            else
            {
                this.updateLastModified();
                callback(null);
            }
        });
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        fs.readFile(this.realPath, callback);
    }
    mimeType(callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.lookup(this.realPath);
        callback(null, mt ? mt as string : 'application/octet-stream');
    }
    size(callback : ReturnCallback<number>)
    {
        fs.stat(this.realPath, (e, s) => callback(e, s ? s.size : null))
    }
    
    // ****************************** Children ****************************** //
    addChild(resource : IResource, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    removeChild(resource : IResource, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(Errors.InvalidOperation, null);
    }
}
