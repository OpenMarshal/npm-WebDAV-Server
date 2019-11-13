import { Readable, Writable, Transform } from 'stream'
import { FTPGateway } from './FTPGateway'
import * as ftpFSManager from './FSManager'
import * as webdav from 'webdav-server'
import * as Client from 'ftp'

export abstract class FTPResource extends webdav.StandardResource
{
    children : webdav.ResourceChildren
    lastUpdate : number

    constructor(public ftpGateway : FTPGateway, public info : Client.ListingElement, public remotePath : string, parent : webdav.IResource, fsManager : webdav.FSManager)
    {
        super(parent, fsManager);

        this.lastUpdate = Date.now();
        this.children = new webdav.ResourceChildren();
    }

    setInfo(info : Client.ListingElement)
    {
        this.info = info;
        this.lastUpdate = Date.now();
    }
    refreshInfo()
    {
        this.lastUpdate = 0;
    }
    getInfo(callback : webdav.ReturnCallback<Client.ListingElement>)
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
    connect(callback : webdav.ReturnCallback<Client>)
    {
        (this.fsManager as ftpFSManager.FTPFSManager).connect((c) => {
            callback(null, c);
        })
    }

    // Overwritten by FTPFile and FTPFolder
    create(callback: webdav.SimpleCallback)
    {
        callback(webdav.Errors.InvalidOperation);
    }

    abstract delete(callback : webdav.SimpleCallback);

    moveTo(parent : webdav.IResource, newName : string, overwrite : boolean, callback : webdav.SimpleCallback)
    {
        if(this.fsManager && parent.fsManager && this.fsManager.uid === parent.fsManager.uid)
        {
            const newRemotePath = ((parent as any).remotePath ? (parent as any).remotePath : '') + '/' + newName;
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

    rename(newName : string, callback : webdav.Return2Callback<string, string>)
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

    write(targetSource : boolean, callback : webdav.ReturnCallback<Writable>)
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

    read(targetSource : boolean, callback : webdav.ReturnCallback<Readable>)
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

    mimeType(targetSource : boolean, callback : webdav.ReturnCallback<string>)
    {
        webdav.StandardResource.standardMimeType(this, targetSource, callback);
    }

    size(targetSource : boolean, callback : webdav.ReturnCallback<number>)
    {
        this.getInfo((e, info) => {
            callback(e, e ? null : parseInt(info.size, 10));
        })
    }

    addChild(resource : webdav.IResource, callback : webdav.SimpleCallback)
    {
        this.children.add(resource, (e) => {
            if(!e)
                resource.parent = this;
            callback(e);
        });
    }

    removeChild(resource : webdav.IResource, callback : webdav.SimpleCallback)
    {
        this.children.remove(resource, (e) => {
            if(!e)
                resource.parent = null;
            callback(e);
        });
    }
    
    getChildren(callback: webdav.ReturnCallback<webdav.IResource[]>)
    {
        callback(null, this.children.children);
    }

    webName(callback : webdav.ReturnCallback<string>)
    {
        this.getInfo((e, info) => {
            callback(e, e ? null : info.name);
        })
    }

    abstract type(callback : webdav.ReturnCallback<webdav.ResourceType>);
}

export class FTPFile extends FTPResource
{
    create(callback: webdav.SimpleCallback)
    {
        this.write(true, (e, w) => {
            if(e)
                callback(e);
            else
                w.end(Buffer.alloc(0), callback);
        })
    }
    
    type(callback : webdav.ReturnCallback<webdav.ResourceType>)
    {
        callback(null, webdav.ResourceType.File);
    }

    delete(callback : webdav.SimpleCallback)
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
}

export class FTPFolder extends FTPResource
{
    create(callback: webdav.SimpleCallback)
    {
        this.connect((e, c) => {
            c.mkdir(this.remotePath, false, (e) => {
                c.end();
                this.refreshInfo();
                callback(e);
            });
        })
    }
    
    type(callback : webdav.ReturnCallback<webdav.ResourceType>)
    {
        callback(null, webdav.ResourceType.Directory);
    }

    delete(callback : webdav.SimpleCallback)
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
}
