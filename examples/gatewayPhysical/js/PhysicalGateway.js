"use strict";
const webdav = require('webdav-server'),
      physicalGFSManager = require('./PhysicalGFSManager.js'),
      path = require('path'),
      fs = require('fs');

module.exports.PhysicalGateway = function(rootPath, customName, parent, fsManager)
{
    const gateway = new webdav.PhysicalFolder(rootPath, parent, fsManager ? fsManager : new physicalGFSManager.PhysicalGFSManager());
    gateway.constructor = module.exports.PhysicalGateway;

    gateway.customName = customName;
    gateway.rootPath = rootPath ? rootPath : '/';
    gateway.cache = {
        '/': gateway
    };
    
    const super_webName = gateway.webName;
    gateway.webName = function(callback)
    {
        if(this.customName)
            callback(null, this.customName);
        else
            super_webName(callback);
    }

    gateway.listChildren = function(parent, rpath, callback)
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
                        resource.deleteOnMoved = true;
                        this.cache[resourcePath] = resource;
                        cb(null, resource);
                    })
                })
                .error(callback)
                .done((resources) => callback(null, resources));
        })
    }

    gateway.find = function(path, callback, forceRefresh = false)
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

    gateway.gateway = function(arg, path, callback)
    {
        const updateChildren = (r, cb) =>
        {
            this.listChildren(r, path.toString(), (e, children) => {
                if(!e)
                {
                    r.children.children
                        .filter((c) => c.constructor !== webdav.PhysicalResource && c.constructor !== webdav.PhysicalFile && c.constructor !== webdav.PhysicalFolder)
                        .forEach((c) => children.push(c));
                        
                    r.children.children = children;
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

    return gateway;
}
