import {
    LocalPropertyManager,
    LastModifiedDateInfo,
    FileSystemSerializer,
    OpenWriteStreamInfo,
    PropertyManagerInfo,
    OpenReadStreamInfo,
    IPropertyManager,
    LocalLockManager,
    CreationDateInfo,
    LockManagerInfo,
    SimpleCallback,
    ReturnCallback,
    ResourceType,
    ILockManager,
    ReadDirInfo,
    CreateInfo,
    DeleteInfo,
    FileSystem,
    SizeInfo,
    MoveInfo,
    TypeInfo,
} from '../fileSystem/export'
import { Readable, Writable } from 'stream'
import { Errors } from '../../../Errors'
import { Path } from '../Path'
import { Transform } from 'stream'
import * as Client from 'ftp'

export class _FTPFileSystemResource
{
    props : LocalPropertyManager
    locks : LocalLockManager
    type : ResourceType

    constructor(data ?: _FTPFileSystemResource)
    {
        if(!data)
        {
            this.props = new LocalPropertyManager();
            this.locks = new LocalLockManager();
        }
        else
        {
            const rs = data as _FTPFileSystemResource;
            this.props = rs.props;
            this.locks = rs.locks;
        }
    }
}

export class FTPSerializer implements FileSystemSerializer
{
    uid() : string
    {
        return 'FTPFSSerializer_1.0.0';
    }

    serialize(fs : FTPFileSystem, callback : ReturnCallback<any>) : void
    {
        callback(null, {
            resources: fs.resources,
            config: fs.config
        });
    }

    unserialize(serializedData : any, callback : ReturnCallback<FileSystem>) : void
    {
        const fs = new FTPFileSystem(serializedData.config);
        fs.resources = serializedData.resources;
        callback(null, fs);
    }
}

export class FTPFileSystem extends FileSystem
{
    resources : {
        [path : string] : _FTPFileSystemResource
    }

    constructor(public config : Client.Options)
    {
        super(new FTPSerializer());

        this.resources = {
            '/': new _FTPFileSystemResource()
        };
    }

    protected getRealPath(path : Path)
    {
        const sPath = path.toString();

        return {
            realPath: sPath,
            resource: this.resources[sPath]
        };
    }
    
    protected connect(callback : (client : Client) => void)
    {
        const client = new Client();
        client.on('ready', () => callback(client));
        client.connect(this.config);
    }

    protected _create(path : Path, ctx : CreateInfo, _callback : SimpleCallback) : void
    {
        if(path.isRoot())
            return _callback(Errors.InvalidOperation);

        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            const callback = (e) => {
                if(!e)
                    this.resources[path.toString()] = new _FTPFileSystemResource();
                else if(e)
                    e = Errors.ResourceAlreadyExists;
                
                c.end();
                _callback(e);
            }

            if(ctx.type.isDirectory)
                c.mkdir(realPath, callback);
            else
            {
                this._openWriteStream(path, {
                    context: ctx.context,
                    estimatedSize: 0,
                    mode: null,
                    targetSource: true
                }, (e, wStream) => {
                    if(e)
                        return callback(e);
                    
                    wStream.end(new Buffer(0), callback)
                })
            }
        })
    }

    protected _delete(path : Path, ctx : DeleteInfo, _callback : SimpleCallback) : void
    {
        if(path.isRoot())
            return _callback(Errors.InvalidOperation);

        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            const callback = (e) => {
                if(!e)
                    delete this.resources[path.toString()];

                c.end();
                _callback(e);
            }

            this.type(ctx.context, path, (e, type) => {
                if(e)
                    return callback(Errors.ResourceNotFound);
                
                if(type.isDirectory)
                    c.rmdir(realPath, callback);
                else
                    c.delete(realPath, callback);
            })
        })
    }

    protected _openWriteStream(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    {
        if(path.isRoot())
            return callback(Errors.InvalidOperation);

        const { realPath, resource } = this.getRealPath(path);

        this.connect((c) => {
            const wStream = new Transform({
                transform(chunk, encoding, cb)
                {
                    cb(null, chunk);
                }
            });
            c.put(wStream, realPath, (e) => {
                c.end();
            });
            callback(null, wStream);
        })
    }

    protected _openReadStream(path : Path, ctx : OpenReadStreamInfo, callback : ReturnCallback<Readable>) : void
    {
        if(path.isRoot())
            return callback(Errors.InvalidOperation);

        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            c.get(realPath, (e, rStream) => {
                if(e)
                    return callback(Errors.ResourceNotFound, null);
                
                const stream = new Transform({
                    transform(chunk, encoding, cb)
                    {
                        cb(null, chunk);
                    }
                });
                stream.on('error', () => {
                    c.end();
                })
                stream.on('finish', () => {
                    c.end();
                })
                rStream.pipe(stream);
                callback(null, stream);
            });
        })
    }

    protected _move(pathFrom : Path, pathTo : Path, ctx : MoveInfo, callback : ReturnCallback<boolean>) : void
    {
        if(pathFrom.isRoot())
            return callback(Errors.InvalidOperation);
        if(pathTo.isRoot())
            return callback(Errors.InvalidOperation);

        const { realPath: realPathFrom } = this.getRealPath(pathFrom);
        const { realPath: realPathTo } = this.getRealPath(pathTo);
        
        this.connect((c) => {
            c.rename(realPathFrom, realPathTo, (e) => {
                if(!e)
                {
                    this.resources[realPathTo] = this.resources[realPathFrom];
                    delete this.resources[realPathFrom];
                    c.end();
                    callback(null, true);
                }
                else
                {
                    c.lastMod(realPathTo, (er) => {
                        if(!er)
                            e = Errors.ResourceAlreadyExists;
                        else
                            e = Errors.ResourceNotFound;
                        c.end();
                        callback(e, false);
                    })
                }
            })
        })
    }

    protected _size(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void
    {
        if(path.isRoot())
            return callback(Errors.InvalidOperation);

        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            c.size(realPath, (e, size) => {
                c.end();
                
                callback(e ? Errors.ResourceNotFound : null, size);
            })
        })
    }

    protected _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void
    {
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new _FTPFileSystemResource();
            this.resources[path.toString()] = resource;
        }

        callback(null, resource.locks);
    }

    protected _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void
    {
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new _FTPFileSystemResource();
            this.resources[path.toString()] = resource;
        }

        callback(null, resource.props);
    }

    protected _readDir(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void
    {
        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            c.list(realPath, (e, list) => {
                c.end();
                
                if(e)
                    return callback(Errors.ResourceNotFound);
                
                callback(null, list.map((el) => el.name));
            })
        });
    }

    protected _creationDate(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void
    {
        this._lastModifiedDate(path, {
            context: ctx.context
        }, callback);
    }

    protected _lastModifiedDate(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void
    {
        if(path.isRoot())
            return callback(null, 0);

        const { realPath } = this.getRealPath(path);

        this.connect((c) => {
            c.lastMod(realPath, (e, date) => {
                c.end();
                callback(e ? Errors.ResourceNotFound : null, !date ? 0 : date.valueOf());
            })
        })
    }

    protected _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void
    {
        if(path.isRoot())
            return callback(null, ResourceType.Directory);
        
        const { realPath } = this.getRealPath(path.getParent());

        this.connect((c) => {
            c.list(realPath, (e, list) => {
                c.end();

                if(e)
                    return callback(Errors.ResourceNotFound);
                
                for(const element of list)
                    if(element.name === path.fileName())
                        return callback(null, element.type === '-' ? ResourceType.File : ResourceType.Directory);

                callback(Errors.ResourceNotFound);
            })
        })
    }
}
