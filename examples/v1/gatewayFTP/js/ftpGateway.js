"use strict";
const webdav = require('webdav-server'),
      Client = require('ftp'),
      ftpResource = require('./Resource'),
      ftpFSManager = require('./fsManager.js');

module.exports.FTPGateway = function(config, rootPath, fileName, parent, fsManager)
{
    const gateway = new webdav.VirtualFolder(fileName, parent, fsManager ? fsManager : new ftpFSManager.FTPFSManager(config));
    gateway.constructor = module.exports.FTPGateway;

    gateway.rootPath = rootPath ? rootPath : '/';
    gateway.cache = {
        '/': gateway
    };

    gateway.listChildren = function(connection, parent, path, callback)
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
                        resource = new ftpResource.FTPFile(this, file, resourcePath, parent, this.fsManager);
                    else
                        resource = new ftpResource.FTPFolder(this, file, resourcePath, parent, this.fsManager);
                    this.cache[resourcePath] = resource;
                }
                return resource;
            }))
        })
    }

    gateway.find = function(connection, path, callback, forceRefresh = false)
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
                            .filter((c) => c.constructor !== ftpResource.FTPResource && c.constructor !== ftpResource.FTPFile && c.constructor !== ftpResource.FTPFolder)
                            .forEach((c) => children.push(c));
                        
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

    gateway.refresh = function(requesterPath, callback)
    {
        const fsPath = new webdav.FSPath(requesterPath);
        
        this.fsManager.connect((c) => {
            this.find(c, fsPath, (e) => {
                c.end();
                callback(e);
            }, true)
        })
    }

    gateway.gateway = function(arg, path, callback)
    {
        const updateChildren = (c, r, cb) =>
        {
            this.listChildren(c, r, path.toString(), (e, children) => {
                if(!e)
                {
                    r.children.children
                        .filter((c) => c.constructor !== ftpResource.FTPResource && c.constructor !== ftpResource.FTPFile && c.constructor !== ftpResource.FTPFolder)
                        .forEach((c) => children.push(c));
                        
                    r.children.children = children;
                }

                c.end();
                cb(e);
            })
        }

        this.fsManager.connect((c) => {
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

    return gateway;
}
