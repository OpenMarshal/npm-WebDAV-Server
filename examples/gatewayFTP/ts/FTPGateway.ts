import * as ftpFSManager from './FSManager'
import * as webdav from 'webdav-server'
import * as Client from 'ftp'
import { FTPFile, FTPFolder, FTPResource } from './Resource'

export class FTPGateway extends webdav.VirtualFolder
{
    rootPath : string
    cache : any

    constructor(config : Client.Options, rootPath : string, fileName : string, parent ?: webdav.IResource, fsManager ?: webdav.FSManager)
    {
        super(fileName, parent, fsManager ? fsManager : new ftpFSManager.FTPFSManager(config));

        this.rootPath = rootPath ? rootPath : '/';
        this.cache = {
            '/': this
        };
    }

    protected listChildren(connection : Client, parent : webdav.IResource, path : string, callback : (error : Error, children ?: FTPResource[]) => void)
    {
        if(path.lastIndexOf('/') !== path.length - 1)
            path += '/';

        connection.list(path, (e, list) => {
            if(e)
            {
                callback(e);
                return;
            }

            callback(null, list.map((file) => {
                const resourcePath = path + file.name;
                let resource = this.cache[resourcePath];
                if(resource && resource.setInfo)
                    resource.setInfo(file);
                else
                {
                    if(file.type === '-')
                        resource = new FTPFile(this, file, resourcePath, parent, this.fsManager);
                    else
                        resource = new FTPFolder(this, file, resourcePath, parent, this.fsManager);
                    this.cache[resourcePath] = resource;
                }
                return resource;
            }))
        })
    }

    protected find(connection : Client, path : webdav.FSPath, callback : (error : Error, resource ?: FTPResource) => void, forceRefresh : boolean = false)
    {
        const resource = this.cache[path.toString()];
        if(forceRefresh || !resource)
        {
            const parentPath = path.getParent();
            this.find(connection, parentPath, (e, parent) => {
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
                
                    this.listChildren(connection, parent, parentPath.toString(), (e, children) => {
                        if(e)
                        {
                            callback(e);
                            return;
                        }
                        
                        parent.children.children
                            .filter((c) => c.constructor !== FTPResource && c.constructor !== FTPFile && c.constructor !== FTPFolder)
                            .forEach((c) => (children as webdav.IResource[]).push(c));
                            
                        parent.children.children = children;

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

    refresh(requesterPath : string, callback : (error : Error) => void)
    {
        const fsPath = new webdav.FSPath(requesterPath);
        
        (this.fsManager as ftpFSManager.FTPFSManager).connect((c) => {
            this.find(c, fsPath, (e) => {
                c.end();
                callback(e);
            }, true)
        })
    }

    gateway(arg : webdav.MethodCallArgs, path : webdav.FSPath, callback : (error : Error, resource ?: webdav.IResource) => void)
    {
        const updateChildren = (c, r, cb) =>
        {
            this.listChildren(c, r, path.toString(), (e, children) => {
                if(!e)
                {
                    r.children.children
                        .filter((c) => c.constructor !== FTPResource && c.constructor !== FTPFile && c.constructor !== FTPFolder)
                        .forEach((c) => (children as webdav.IResource[]).push(c));
                        
                    r.children.children = children;
                }

                c.end();
                cb(e);
            })
        }

        (this.fsManager as ftpFSManager.FTPFSManager).connect((c) => {
            if(path.isRoot())
            {
                updateChildren(c, this, (e) => {
                    callback(e, this);
                })
                return;
            }

            this.find(c, path, (e, r) => {
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
                        c.end();
                        callback(e, r);
                        return;
                    }

                    updateChildren(c, r, (e) => {
                        callback(e, r);
                    })
                })
            });
        });
    }
}
