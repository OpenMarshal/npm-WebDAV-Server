import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource'
import { Readable, Writable } from 'stream'
import { ResourceChildren } from '../std/ResourceChildren'
import { StandardResource } from '../std/StandardResource'
import { PhysicalResource } from './PhysicalResource'
import { PhysicalFile } from './PhysicalFile'
import { FSManager } from '../../../manager/v1/FSManager'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import * as path from 'path'
import * as fs from 'fs'

function loader(fpath : string, callback : (error : Error, resources ?: IResource[]) => void)
{
    fs.readdir(fpath, (e, files) => {
        if(e) throw e;

        new Workflow()
            .each(files, (file, cb) => {
                const fullPath = path.join(fpath, file);

                fs.stat(fullPath, (e, stat) => {
                    if(e)
                        cb(e);
                    else if(stat.isFile())
                        cb(null, new PhysicalFile(fullPath));
                    else
                    {
                        const folder = new PhysicalFolder(fullPath);
                        loader(fullPath, (e, resources) => {
                            if(e)
                                cb(e);
                            else
                            {
                                new Workflow()
                                    .each(resources, (r, cb) => folder.addChild(r, cb))
                                    .error(cb)
                                    .done(() => cb(null, folder));
                            }
                        })
                    }
                })
            })
            .error(callback)
            .done((resources) => callback(null, resources));
    });
}

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
    write(targetSource : boolean, callback : ReturnCallback<Writable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    read(targetSource : boolean, callback : ReturnCallback<Readable>)
    {
        callback(Errors.InvalidOperation, null);
    }
    mimeType(targetSource : boolean, callback : ReturnCallback<string>)
    {
        callback(Errors.NoMimeTypeForAFolder, null);
    }
    size(targetSource : boolean, callback : ReturnCallback<number>)
    {
        callback(Errors.NoSizeForAFolder, null);
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
        this.children.remove(resource, (e) => {
            if(!e)
                resource.parent = null;
            callback(e);
        });
    }
    getChildren(callback : ReturnCallback<IResource[]>)
    {
        callback(null, this.children.children);
    }
    
    static loadFromPath(path : string, callback : ReturnCallback<PhysicalFolder>)
    {
        loader(path, (e, resources) => {
            if(!e)
            {
                const folder = new PhysicalFolder(path);
                new Workflow()
                    .each(resources, (r, cb) => folder.addChild(r, cb))
                    .error((e) => callback(e, null))
                    .done(() => callback(null, folder));
            }
            else
                callback(e, null);
        })
    }
}
