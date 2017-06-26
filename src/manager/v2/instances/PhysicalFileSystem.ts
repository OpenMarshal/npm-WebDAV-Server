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

export class _PhysicalFileSystemResource
{
    props : LocalPropertyManager
    locks : LocalLockManager

    constructor(data ?: _PhysicalFileSystemResource)
    {
        if(!data)
        {
            this.props = new LocalPropertyManager();
            this.locks = new LocalLockManager();
        }
        else
        {
            const rs = data as _PhysicalFileSystemResource;
            this.props = rs.props;
            this.locks = rs.locks;
        }
    }
}

export class PhysicalSerializer implements FileSystemSerializer
{
    uid() : string
    {
        return 'PhysicalFSSerializer_1.0.0';
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
        const fs = new PhysicalFileSystem(serializedData.rootPath);
        fs.resources = serializedData.resources;
        callback(null, fs);
    }
}

export class PhysicalFileSystem extends FileSystem
{
    resources : {
        [path : string] : _PhysicalFileSystemResource
    }

    constructor(public rootPath : string)
    {
        super(new PhysicalSerializer());

        this.resources = {
            '/': new _PhysicalFileSystemResource()
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
                this.resources[path.toString()] = new _PhysicalFileSystemResource();
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
                fs.writeFile(realPath, new Buffer(0), callback);
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
                fs.rmdir(realPath, callback);
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
                this.resources[path.toString()] = new _PhysicalFileSystemResource();
            
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
        
        fs.rename(realPathFrom, realPathTo, (e) => {
            if(!e)
            {
                this.resources[realPathTo] = this.resources[realPathFrom];
                delete this.resources[realPathFrom];
                callback(null, true);
            }
            else
            {
                fs.stat(realPathTo, (er) => {
                    if(!er)
                        e = Errors.ResourceAlreadyExists;
                    else
                        e = Errors.ResourceNotFound;
                    callback(e, false);
                })
            }
        })
    }

    protected _size(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.stat(realPath, (e, stat) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, stat.size);
        })
    }

    protected _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void
    {
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new _PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
        }

        callback(null, resource.locks);
    }

    protected _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void
    {
        let resource = this.resources[path.toString()];
        if(!resource)
        {
            resource = new _PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
        }

        callback(null, resource.props);
    }

    protected _readDir(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.readdir(realPath, (e, files) => {
            callback(e ? Errors.ResourceNotFound : null, files);
        });
    }

    protected _creationDate(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.stat(realPath, (e, stat) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, stat.birthtime.valueOf());
        })
    }

    protected _lastModifiedDate(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void
    {
        const { realPath } = this.getRealPath(path);

        fs.stat(realPath, (e, stat) => {
            if(e)
                return callback(Errors.ResourceNotFound);
            
            callback(null, stat.mtime.valueOf());
        })
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
