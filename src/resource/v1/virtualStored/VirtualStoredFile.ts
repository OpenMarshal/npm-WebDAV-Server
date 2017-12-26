import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable, Transform } from 'stream'
import { VirtualStoredResource } from './VirtualStoredResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { VirtualStoredFSManager } from '../../../manager/v1/VirtualStoredFSManager'
import { Errors } from '../../../Errors'
import * as mimeTypes from 'mime-types'

export class VirtualStoredFile extends VirtualStoredResource
{
    contentUid : string
    len : number

    constructor(name : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(name, parent, fsManager);

        this.contentUid = null;
        this.len = 0;
    }

    create(callback : SimpleCallback)
    {
        if(this.contentUid)
        {
            callback(null);
            return;
        }

        (this.fsManager as VirtualStoredFSManager).contentManager.allocate((e, contentUid) => {
            this.contentUid = contentUid;
            callback(e);
        })
    }
    delete(callback : SimpleCallback)
    {
        (this.fsManager as VirtualStoredFSManager).contentManager.deallocate(this.contentUid, (e) => {
            if(e)
                callback(e);
            else
                this.removeFromParent(callback);
        });
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.File)
    }

    // ****************************** Content ****************************** //
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    {
        (this.fsManager as VirtualStoredFSManager).contentManager.write(this.contentUid, (e, w) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            let size = 0;

            const wr = new Transform({
                transform(chunk, encoding, cb)
                {
                    size += chunk.length;
                    this.push(chunk);
                    cb();
                }
            });
            wr.on('finish', () => {
                this.updateLastModified();
                this.len = size;
            })

            wr.pipe(w);

            callback(null, wr);
        });
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        (this.fsManager as VirtualStoredFSManager).contentManager.read(this.contentUid, callback);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.contentType(this.name);
        callback(null, mt ? mt as string : 'application/octet-stream');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback(null, this.len);
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
