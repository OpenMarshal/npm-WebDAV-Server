import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { ResourceChildren, forAll } from '../std/ResourceChildren'
import { StandardResource } from '../std/StandardResource'
import { PhysicalResource } from './PhysicalResource'
import { FSManager } from '../../manager/FSManager'
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

            forAll<IResource>(children, (child, cb) => {
                child.delete(cb);
            }, () => {
                fs.rmdir(this.realPath, (e) => {
                    if(e)
                        callback(e);
                    else
                        this.removeFromParent(callback);
                });
            }, callback)
        })
    }

    // ****************************** Content ****************************** //
    append(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    write(data : Int8Array, callback : SimpleCallback)
    {
        callback(new Error('Invalid operation'));
    }
    read(callback : ReturnCallback<Int8Array>)
    {
        callback(new Error('Invalid operation'), null);
    }
    mimeType(callback : ReturnCallback<string>)
    {
        callback(null, 'directory');
    }
    size(callback : ReturnCallback<number>)
    {
        StandardResource.sizeOfSubFiles(this, callback);
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
