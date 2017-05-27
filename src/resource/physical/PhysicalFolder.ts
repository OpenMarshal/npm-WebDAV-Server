import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, ReadableOptions } from 'stream'
import { ResourceChildren } from '../std/ResourceChildren'
import { StandardResource } from '../std/StandardResource'
import { PhysicalResource } from './PhysicalResource'
import { FSManager } from '../../manager/FSManager'
import { Errors } from '../../Errors'
import * as fs from 'fs'

export class PhysicalFolder extends PhysicalResource
{
    children : ResourceChildren

    constructor(realPath : string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(realPath, parent, fsManager);

        this.children = new ResourceChildren();
    }

    // ****************************** Std meta-data ****************************** //
    type(callback : ReturnCallback<ResourceType>)
    {
        callback(null, ResourceType.Directory)
    }
    
    // ****************************** Actions ****************************** //
    create(callback : SimpleCallback)
    {
        fs.mkdir(this.realPath, callback)
    }
    delete(callback : SimpleCallback)
    {
        this.getChildren((e, children) => {
            if(e)
            {
                callback(e);
                return;
            }

            if(children.length === 0)
            {
                fs.rmdir(this.realPath, (e) => {
                    if(e)
                        callback(e);
                    else
                        this.removeFromParent(callback);
                });
                return;
            }

            let nb = children.length;
            const go = (e) =>
            {
                if(nb <= 0)
                    return;
                
                --nb;

                if(e)
                {
                    nb = -1;
                    callback(e);
                    return;
                }

                if(nb === 0)
                {
                    fs.rmdir(this.realPath, (e) => {
                        if(e)
                            callback(e);
                        else
                            this.removeFromParent(callback);
                    });
                }
            }

            children.forEach(child => {
                process.nextTick(() => child.delete(go));
            })
        })
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    write(data : Int8Array, targetSource : boolean, callback : SimpleCallback)
    {
        callback(Errors.InvalidOperation);
    }
    read(targetSource : boolean, callback : ReturnCallback<Int8Array|Readable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback(null, 'directory');
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        StandardResource.sizeOfSubFiles(this, targetSource, callback);
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
