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
import { join as pathJoin } from 'path'
import { Errors } from '../../../Errors'
import { Path } from '../Path'
import * as fs from 'fs'

export class PhysicalFileSystemResource
{
    props : LocalPropertyManager
    locks : LocalLockManager

    constructor(data ?: PhysicalFileSystemResource)
    {
        if(!data)
        {
            this.props = new LocalPropertyManager();
            this.locks = new LocalLockManager();
        }
        else
        {
            const rs = data as PhysicalFileSystemResource;
            this.props = new LocalPropertyManager(rs.props);
            this.locks = new LocalLockManager();
        }
    }
}

export class PhysicalSerializer implements FileSystemSerializer
{
    uid() : string
    {
        return 'PhysicalFSSerializer-1.0.0';
    }

    serialize(fs : PhysicalFileSystem, callback : ReturnCallback<any>) : void
    {
        callback(null, {
            resources: fs.resources,
            rootPath: fs.rootPath
        });
    }

    unserialize(serializedData : any, callback : ReturnCallback<FileSystem>) : void
    {
        // tslint:disable-next-line:no-use-before-declare
        const fs = new PhysicalFileSystem(serializedData.rootPath);
        fs.resources = serializedData.resources;
        callback(null, fs);
    }
}

export const PhysicalSerializerVersions = {
    versions: {
        '1.0.0': PhysicalSerializer,
    },
    instances: [
        new PhysicalSerializer()
    ] as FileSystemSerializer[]
}

export class PhysicalFileSystem extends FileSystem
{
    resources : {
        [path : string] : PhysicalFileSystemResource
    }

    constructor(public rootPath : string)
    {
        super(new PhysicalSerializer());

        this.resources = {
            '/': new PhysicalFileSystemResource()
        };
    }

    protected getRealPath(path : Path)
    {
        const sPath = path.toString();

        return {
            realPath: pathJoin(this.rootPath, sPath.substr(1)),
            resource: this.resources[sPath]
        };
    }

    protected _create(path : Path, ctx : CreateInfo, _callback : SimpleCallback) : void
    {
        const { realPath } = this.getRealPath(path);

        const callback = (e) => {
            if(!e)
                this.resources[path.toString()] = new PhysicalFileSystemResource();
            else if(e)
                e = Errors.ResourceAlreadyExists;
            
            _callback(e);
        }

        if(ctx.type.isDirectory)
            fs.mkdir(realPath, callback);
        else
        {
            if(!fs.constants || !fs.constants.O_CREAT)
            { // node v5.* and lower
                fs.writeFile(realPath, Buffer.alloc(0), callback);
            }
            else
            { // node v6.* and higher
                fs.open(realPath, fs.constants.O_CREAT, (e, fd) => {
                    if(e)
                        return callback(e);
                    fs.close(fd, callback);
                })
            }
        }
    }

    protected _delete(path : Path, ctx : DeleteInfo, _callback : SimpleCallback) : void
    {
        const { realPath } = this.getRealPath(path);

        const callback = (e) => {
            if(!e)
                delete this.resources[path.toString()];
            _callback(e);
        }

        this.type(ctx.context, path, (e, type) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            if(type.isDirectory)
            {
                if(ctx.depth === 0)
                    return fs.rmdir(realPath, callback);

                this.readDir(ctx.context, path, (e, files) => {
                    let nb = files.length + 1;
                    const done = (e ?: Error) => {
                        if(nb < 0)
                            return;

                        if(e)
                        {
                            nb = -1;
                            return callback(e);
                        }
                        
                        if(--nb === 0)
                            fs.rmdir(realPath, callback);
                    }

                    files.forEach((file) => this.delete(ctx.context, path.getChildPath(file), ctx.depth === -1 ? -1 : ctx.depth - 1, done));
                    done();
                })
            }
            else
                fs.unlink(realPath, callback);
        })
    }

    protected _openWriteStream(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    {
        const { realPath, resource } = this.getRealPath(path);

        fs.open(realPath, 'w+', (e, fd) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            if(!resource)
                this.resources[path.toString()] = new PhysicalFileSystemResource();
            
            callback(null, fs.createWriteStream(null, { fd }));
        })
    }

    protected _openReadStream(path : Path, ctx : OpenReadStreamInfo, callback : ReturnCallback<Readable>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.open(realPath, 'r', (e, fd) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, fs.createReadStream(null, { fd }));
        })
    }

    protected _move(pathFrom : Path, pathTo : Path, ctx : MoveInfo, callback : ReturnCallback<boolean>) : void
    {
        const { realPath: realPathFrom } = this.getRealPath(pathFrom);
        const { realPath: realPathTo } = this.getRealPath(pathTo);

        const rename = (overwritten) => {
            fs.rename(realPathFrom, realPathTo, (e) => {
                if(e)
                    return callback(e);

                this.resources[realPathTo] = this.resources[realPathFrom];
                delete this.resources[realPathFrom];
                callback(null, overwritten);
            });
        };

        fs.access(realPathTo, (e) => {
            if(e)
            { // destination doesn't exist
                rename(false);
            }
            else
            { // destination exists
                if(!ctx.overwrite)
                    return callback(Errors.ResourceAlreadyExists);
                
                this.delete(ctx.context, pathTo, (e) => {
                    if(e)
                        return callback(e);
                    rename(true);
                });
            }
        })
    }

    protected _size(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void
    {
        this.getStatProperty(path, ctx, 'size', callback);
    }
    
    /**
     * Get a property of an existing resource (object property, not WebDAV property). If the resource doesn't exist, it is created.
     * 
     * @param path Path of the resource
     * @param ctx Context of the method
     * @param propertyName Name of the property to get from the resource
     * @param callback Callback returning the property object of the resource
     */
    protected getPropertyFromResource(path : Path, ctx : any, propertyName : string, callback : ReturnCallback<any>) : void
    {
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
        }

        callback(null, resource[propertyName]);
    }

    protected _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void
    {
        this.getPropertyFromResource(path, ctx, 'locks', callback);
    }

    protected _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void
    {
        this.getPropertyFromResource(path, ctx, 'props', callback);
    }

    protected _readDir(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.readdir(realPath, (e, files) => {
            callback(e ? Errors.ResourceNotFound : null, files);
        });
    }
    
    protected getStatProperty(path : Path, ctx : any, propertyName : string, callback : ReturnCallback<any>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.stat(realPath, (e, stat) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, stat[propertyName]);
        })
    }
    protected getStatDateProperty(path : Path, ctx : any, propertyName : string, callback : ReturnCallback<number>) : void
    {
        this.getStatProperty(path, ctx, propertyName, (e, value) => callback(e, value ? (value as Date).valueOf() : value));
    }

    protected _creationDate(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void
    {
        this.getStatDateProperty(path, ctx, 'birthtime', callback);
    }

    protected _lastModifiedDate(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void
    {
        this.getStatDateProperty(path, ctx, 'mtime', callback);
    }

    protected _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.stat(realPath, (e, stat) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, stat.isDirectory() ? ResourceType.Directory : ResourceType.File);
        })
    }
}
