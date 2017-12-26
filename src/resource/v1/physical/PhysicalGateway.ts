import { IResource, ReturnCallback } from '../IResource'
import { PhysicalGFSManager } from '../../../manager/v1/PhysicalGFSManager'
import { FSManager, FSPath } from '../../../manager/v1/FSManager'
import { PhysicalResource } from './PhysicalResource'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { PhysicalFolder } from './PhysicalFolder'
import { PhysicalFile } from './PhysicalFile'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import * as path from 'path'
import * as fs from 'fs'

export class PhysicalGateway extends PhysicalFolder
{
    cache : {
        [path : string] : PhysicalResource
    }

    constructor(rootPath : string, protected customName ?: string, parent ?: IResource, fsManager ?: FSManager)
    {
        super(rootPath, parent, fsManager ? fsManager : new PhysicalGFSManager());

        this.cache = {
            '/': this
        };
    }

    webName(callback : ReturnCallback<string>)
    {
        if(this.customName)
            callback(null, this.customName);
        else
            super.webName(callback);
    }

    protected listChildren(parent : PhysicalResource, rpath : string, callback : (error : Error, children ?: IResource[]) => void)
    {
        if(rpath.lastIndexOf('/') !== rpath.length - 1)
            rpath += '/';

        fs.readdir(parent.realPath, (e, list) => {
            if(e)
            {
                callback(e);
                return;
            }

            new Workflow()
                .each(list, (file, cb) => {
                    const resourcePath = rpath + file;
                    let resource = this.cache[resourcePath];
                    const realPath = path.join(parent.realPath, file);

                    if(resource)
                    {
                        cb(null, resource);
                        return;
                    }

                    fs.stat(realPath, (e, stat) => {
                        if(e)
                        {
                            cb(e);
                            return;
                        }

                        if(stat.isFile())
                            resource = new PhysicalFile(realPath, parent, this.fsManager);
                        else
                            resource = new PhysicalFolder(realPath, parent, this.fsManager);
                        (resource as PhysicalResource).deleteOnMoved = true;
                        this.cache[resourcePath] = resource;
                        cb(null, resource);
                    })
                })
                .error(callback)
                .done((resources) => callback(null, resources));
        })
    }

    protected find(path : FSPath, callback : (error : Error, resource ?: PhysicalResource) => void, forceRefresh : boolean = false)
    {
        const resource = this.cache[path.toString()];
        if(forceRefresh || !resource)
        {
            const parentPath = path.getParent();
            this.find(parentPath, (e, parent) => {
                if(e)
                {
                    callback(e);
                    return;
                }

                parent.getChildren((e, actualChildren) => {
                    if(e)
                    {
                        callback(e);
                        return;
                    }
                
                    this.listChildren(parent, parentPath.toString(), (e, children) => {
                        if(e)
                        {
                            callback(e);
                            return;
                        }

                        actualChildren
                            .filter((c) => c.constructor !== PhysicalResource && c.constructor !== PhysicalFile && c.constructor !== PhysicalFolder)
                            .forEach((c) => children.push(c));
                            
                        (parent as PhysicalFolder).children.children = children;

                        new Workflow()
                            .each(children, (child, cb) => {
                                child.webName((e, name) => {
                                    cb(e, !e && name === path.fileName() ? child : null);
                                })
                            })
                            .error(callback)
                            .done((matchingChildren) => {
                                for(const child of matchingChildren)
                                    if(child)
                                    {
                                        callback(null, child);
                                        return;
                                    }
                                
                                callback(Errors.ResourceNotFound);
                            })
                    })
                })
            })
        }
        else
            callback(null, resource);
    }

    gateway(arg : MethodCallArgs, path : FSPath, callback : (error : Error, resource ?: IResource) => void)
    {
        const updateChildren = (r, cb) =>
        {
            this.listChildren(r, path.toString(), (e, children) => {
                if(!e)
                {
                    (r as PhysicalFolder).children.children
                        .filter((c) => c.constructor !== PhysicalResource && c.constructor !== PhysicalFile && c.constructor !== PhysicalFolder)
                        .forEach((c) => (children as IResource[]).push(c));
                        
                    (r as PhysicalFolder).children.children = children;
                }
                cb(e);
            })
        }

        if(path.isRoot())
        {
            updateChildren(this, (e) => {
                callback(e, this);
            })
            return;
        }

        this.find(path, (e, r) => {
            if(e)
            {
                callback(e);
                return;
            }

            r.type((e, type) => {
                if(e)
                {
                    callback(e);
                    return;
                }

                if(type.isFile)
                {
                    callback(e, r);
                    return;
                }

                updateChildren(r, (e) => {
                    callback(e, r);
                })
            })
        });
    }
}
