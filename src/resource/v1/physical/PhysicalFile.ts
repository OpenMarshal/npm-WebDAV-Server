import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { PhysicalResource } from './PhysicalResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'
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
        callback = this.wrapCallback(callback);

        if(!fs.constants || !fs.constants.O_CREAT)
        { // node v5.* and lower
            fs.writeFile(this.realPath, '', callback);
        }
        else
        { // node v6.* and higher
            fs.open(this.realPath, fs.constants.O_CREAT, (e, fd) => {
                if(e)
                    callback(e);
                else
                    fs.close(fd, (e) => {
                        callback(e);
                    });
            })
        }
    }
    delete(callback : SimpleCallback)
    {
        callback = this.wrapCallback(callback);

        fs.unlink(this.realPath, (e) => {
            if(e)
                callback(e);
            else
                this.removeFromParent(callback);
        })
    }

    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    {
        callback = this.wrapCallback(callback);

        fs.open(this.realPath, 'w', (e, fd) => {
            if(e)
            {
                callback(e, null);
                return;
            }
            
            callback(null, fs.createWriteStream(null, { fd }));
            this.updateLastModified();
        })
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        callback = this.wrapCallback(callback);

        fs.open(this.realPath, 'r', (e, fd) => {
            if(e)
            {
                callback(e, null);
                return;
            }
            
            callback(null, fs.createReadStream(null, { fd }));
            this.updateLastModified();
        })
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback = this.wrapCallback(callback);

        const mt = mimeTypes.contentType(this.realPath);
        callback(null, mt ? mt as string : 'application/octet-stream');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback = this.wrapCallback(callback);

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
