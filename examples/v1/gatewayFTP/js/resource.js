"use strict";
const webdav = require('webdav-server'),
      Transform = require('stream').Transform,
      Client = require('ftp'),
      ftpGateway = require('./ftpGateway.js'),
      ftpFSManager = require('./fsManager.js');

module.exports.FTPResource = function(ftpGateway, info, remotePath, parent, fsManager)
{
    const stdRes = new webdav.StandardResource(parent, fsManager);
    stdRes.constructor = module.exports.FTPResource;

    stdRes.ftpGateway = ftpGateway;
    stdRes.info = info;
    stdRes.remotePath = remotePath;
    stdRes.lastUpdate = Date.now();
    stdRes.children = new webdav.ResourceChildren();

    stdRes.setInfo = function(info)
    {
        this.info = info;
        this.lastUpdate = Date.now();
    }
    stdRes.refreshInfo = function()
    {
        this.lastUpdate = 0;
    }
    stdRes.getInfo = function(callback)
    {
        const now = Date.now();
        if(now - this.lastUpdate > 1000)
            this.ftpGateway.refresh(this.remotePath, (e) => {
                this.lastUpdate = now;
                callback(e, this.info);
            })
        else
            callback(null, this.info);
    }
    stdRes.connect = function(callback)
    {
        this.fsManager.connect((c) => {
            callback(null, c);
        })
    }

    // Overwritten by FTPFile and FTPFolder
    stdRes.create = function(callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }

    stdRes.moveTo = function(parent, newName, overwrite, callback)
    {
        if(this.fsManager && parent.fsManager && this.fsManager.uid === parent.fsManager.uid)
        {
            const newRemotePath = (parent.remotePath ? parent.remotePath : '') + '/' + newName;
            this.read(true, (e, rStream) => {
                this.connect((e, c) => {
                    if(e)
                    {
                        callback(e);
                        return;
                    }

                    c.put(rStream, newRemotePath, (e) => {
                        if(e)
                        {
                            callback(e);
                            return;
                        }

                        c.delete(this.remotePath, (e) => {
                            if(!e)
                            {
                                delete this.ftpGateway.cache[this.remotePath];
                                this.remotePath = newRemotePath;
                                this.ftpGateway.cache[this.remotePath] = this;
                            }

                            this.refreshInfo();
                            callback(e);
                        })
                    })
                })
            })
        }
        else
            callback(webdav.Errors.InvalidOperation);
    }

    stdRes.rename = function(newName, callback)
    {
        this.getInfo((e, info) => {
            if(e)
            {
                callback(e, null, null);
                return;
            }

            this.connect((e, c) => {
                c.rename(info.name, newName, (e) => {
                    this.refreshInfo();
                    this.updateLastModified();
                    c.end();

                    const newRemotePath = new webdav.FSPath(this.remotePath).getParent().getChildPath(newName).toString();
                    delete this.ftpGateway.cache[this.remotePath];
                    this.remotePath = newRemotePath;
                    this.ftpGateway.cache[this.remotePath] = this;

                    callback(e, info.name, newName);
                });
            })
        })
    }

    stdRes.write = function(targetSource, callback)
    {
        this.connect((e, c) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            const wStream = new Transform({
                transform(chunk, encoding, cb)
                {
                    cb(null, chunk);
                }
            });
            c.put(wStream, this.remotePath, (e) => {
                this.refreshInfo();
                this.updateLastModified();
                c.end();
            });
            callback(null, wStream);
        })
    }

    stdRes.read = function(targetSource, callback)
    {
        this.connect((e, c) => {
            if(e)
            {
                callback(e, null);
                return;
            }

            c.get(this.remotePath, (e, rStream) => {
                if(e)
                {
                    callback(e, null);
                    return;
                }
                
                const stream = new Transform({
                    transform(chunk, encoding, cb)
                    {
                        cb(null, chunk);
                    }
                });
                stream.on('finish', () => {
                    c.end();
                })
                rStream.pipe(stream);
                callback(null, stream);
            });
        })
    }

    stdRes.mimeType = function(targetSource, callback)
    {
        webdav.StandardResource.standardMimeType(this, targetSource, callback);
    }

    stdRes.size = function(targetSource, callback)
    {
        this.getInfo((e, info) => {
            callback(e, e ? null : parseInt(info.size, 10));
        })
    }

    stdRes.addChild = function(resource, callback)
    {
        this.children.add(resource, (e) => {
            if(!e)
                resource.parent = this;
            callback(e);
        });
    }

    stdRes.removeChild = function(resource, callback)
    {
        this.children.remove(resource, (e) => {
            if(!e)
                resource.parent = null;
            callback(e);
        });
    }
    
    stdRes.getChildren = function(callback)
    {
        callback(null, this.children.children);
    }

    stdRes.webName = function(callback)
    {
        this.getInfo((e, info) => {
            callback(e, e ? null : info.name);
        })
    }

    return stdRes;
}

module.exports.FTPFile = function(ftpGateway, info, remotePath, parent, fsManager)
{
    const resource = new module.exports.FTPResource(ftpGateway, info, remotePath, parent, fsManager);
    resource.constructor = module.exports.FTPFile;
    
    resource.create = function(callback)
    {
        this.write(true, (e, w) => {
            if(e)
                callback(e);
            else
                w.end(new Buffer(0), callback);
        })
    }
    
    resource.type = function(callback)
    {
        callback(null, webdav.ResourceType.File);
    }

    resource.delete = function(callback)
    {
        this.connect((e, c) => {
            c.delete(this.remotePath, (e) => {
                this.refreshInfo();
                c.end();
                
                if(!e)
                    webdav.StandardResource.standardRemoveFromParent(this, callback);
                else
                    callback(e);
            })
        })
    }
    
    return resource;
}

module.exports.FTPFolder = function(ftpGateway, info, remotePath, parent, fsManager)
{
    const resource = new module.exports.FTPResource(ftpGateway, info, remotePath, parent, fsManager);
    resource.constructor = module.exports.FTPFolder;
    
    resource.create = function(callback)
    {
        this.connect((e, c) => {
            c.mkdir(this.remotePath, false, (e) => {
                c.end();
                this.refreshInfo();
                callback(e);
            });
        })
    }
    
    resource.type = function(callback)
    {
        callback(null, webdav.ResourceType.Directory);
    }

    resource.delete = function(callback)
    {
        this.connect((e, c) => {
            c.rmdir(this.remotePath, (e) => {
                this.refreshInfo();
                c.end();
                
                if(!e)
                    webdav.StandardResource.standardRemoveFromParent(this, callback);
                else
                    callback(e);
            })
        })
    }

    return resource;
}
