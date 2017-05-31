import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { VirtualStoredResource } from './VirtualStoredResource'
import { FSManager } from '../../manager/FSManager'
import { VirtualStoredFSManager } from '../../manager/VirtualStoredFSManager'
import { Errors } from '../../Errors'
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

            const wr = new Writable({
                write: (chunk, encoding, cb) => {
                    size += chunk.length;
                    return w.write(chunk, encoding, cb);
                }
            });
            wr.on('finish', () => {
                this.updateLastModified();
                this.len = size;
            })
            callback(null, wr);
        });
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        (this.fsManager as VirtualStoredFSManager).contentManager.read(this.contentUid, callback);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        const mt = mimeTypes.lookup(this.name);
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
