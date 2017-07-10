import { PhysicalGFSManager } from './PhysicalGFSManager'
import * as webdav from 'webdav-server'
import * as path from 'path'
import * as fs from 'fs'

export class PhysicalGateway extends webdav.PhysicalFolder
{
    cache : {
        [path : string] : webdav.PhysicalResource
    }

    constructor(rootPath : string, protected customName ?: string, parent ?: webdav.IResource, fsManager ?: webdav.FSManager)
    {
        super(rootPath, parent, fsManager ? fsManager : new PhysicalGFSManager());

        this.cache = {
            '/': this
        };
    }

    webName(callback : webdav.ReturnCallback<string>)
    {
        if(this.customName)
            callback(null, this.customName);
        else
            super.webName(callback);
    }

    protected listChildren(parent : webdav.PhysicalResource, rpath : string, callback : (error : Error, children ?: webdav.IResource[]) => void)
    {
        if(rpath.lastIndexOf('/') !== rpath.length - 1)
            rpath += '/';

        fs.readdir(parent.realPath, (e, list) => {
            if(e)
            {
                callback(e);
                return;
            }

            new webdav.Workflow()
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
                            resource = new webdav.PhysicalFile(realPath, parent, this.fsManager);
                        else
                            resource = new webdav.PhysicalFolder(realPath, parent, this.fsManager);
                        (resource as webdav.PhysicalResource).deleteOnMoved = true;
                        this.cache[resourcePath] = resource;
                        cb(null, resource);
                    })
                })
                .error(callback)
                .done((resources) => callback(null, resources));
        })
    }

    protected find(path : webdav.FSPath, callback : (error : Error, resource ?: webdav.PhysicalResource) => void, forceRefresh : boolean = false)
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
                            .filter((c) => c.constructor !== webdav.PhysicalResource && c.constructor !== webdav.PhysicalFile && c.constructor !== webdav.PhysicalFolder)
                            .forEach((c) => children.push(c));
                            
                        (parent as webdav.PhysicalFolder).children.children = children;

                        new webdav.Workflow()
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
                                
                                callback(webdav.Errors.ResourceNotFound);
                            })
                    })
                })
            })
        }
        else
            callback(null, resource);
    }

    gateway(arg : webdav.MethodCallArgs, path : webdav.FSPath, callback : (error : Error, resource ?: webdav.IResource) => void)
    {
        const updateChildren = (r, cb) =>
        {
            this.listChildren(r, path.toString(), (e, children) => {
                if(!e)
                {
                    (r as webdav.PhysicalFolder).children.children
                        .filter((c) => c.constructor !== webdav.PhysicalResource && c.constructor !== webdav.PhysicalFile && c.constructor !== webdav.PhysicalFolder)
                        .forEach((c) => (children as webdav.IResource[]).push(c));
                        
                    (r as webdav.PhysicalFolder).children.children = children;
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
