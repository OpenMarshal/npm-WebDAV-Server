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
import { RequestContext } from '../../../server/v2/RequestContext'
import { Errors } from '../../../Errors'
import { Path } from '../Path'

export class _VirtualFileSystemResource
{
    props : LocalPropertyManager
    locks : LocalLockManager
    content : Buffer[]
    size : number
    lastModifiedDate : number
    creationDate : number
    type : ResourceType

    constructor(data : _VirtualFileSystemResource | ResourceType)
    {
        if(data.constructor === ResourceType)
        {
            this.lastModifiedDate = Date.now();
            this.creationDate = Date.now();
            this.content = [];
            this.props = new LocalPropertyManager();
            this.locks = new LocalLockManager();
            this.type = data as ResourceType;
            this.size = 0;
        }
        else
        {
            const rs = data as _VirtualFileSystemResource;
            this.lastModifiedDate = rs.lastModifiedDate;
            this.creationDate = rs.creationDate;
            this.content = rs.content;
            this.props = rs.props;
            this.locks = rs.locks;
            this.size = rs.size;
            this.type = rs.type;
        }
    }

    static updateLastModified(r : _VirtualFileSystemResource)
    {
        r.lastModifiedDate = Date.now();
    }
}

export class VirtualFileReadable extends Readable
{
    blockIndex : number

    constructor(public contents : Int8Array[])
    {
        super();

        this.blockIndex = -1;
    }

    _read(size : number)
    {
        while(true)
        {
            ++this.blockIndex;

            if(this.blockIndex >= this.contents.length)
            {
                this.push(null);
                break;
            }

            if(!this.push(this.contents[this.blockIndex]))
                break;
        }
    }
}

export class VirtualFileWritable extends Writable
{
    constructor(public contents : Int8Array[])
    {
        super(null);
    }

    _write(chunk : Buffer | string | any, encoding : string, callback : (error : Error) => void)
    {
        this.contents.push(chunk);
        callback(null);
    }
}

export class VirtualSerializer implements FileSystemSerializer
{
    uid() : string
    {
        return 'VirtualFSSerializer_1.0.0';
    }

    serialize(fs : VirtualFileSystem, callback : ReturnCallback<any>) : void
    {
        callback(null, fs.resources);
    }

    unserialize(serializedData : any, callback : ReturnCallback<FileSystem>) : void
    {
        const fs = new VirtualFileSystem();
        fs.resources = serializedData;
        callback(null, fs);
    }
}

export class VirtualFileSystem extends FileSystem
{
    resources : {
        [path : string] : _VirtualFileSystemResource
    }

    constructor(serializer ?: FileSystemSerializer)
    {
        super(serializer ? serializer : new VirtualSerializer());

        this.resources = {
            '/': new _VirtualFileSystemResource(ResourceType.Directory)
        };
    }
    
    protected _fastExistCheck(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void
    {
        callback(this.resources[path.toString()] !== undefined);
    }

    protected _create(path : Path, ctx : CreateInfo, callback : SimpleCallback) : void
    {
        this.resources[path.toString()] = new _VirtualFileSystemResource(ctx.type);
        callback();
    }

    protected _delete(path : Path, ctx : DeleteInfo, callback : SimpleCallback) : void
    {
        delete this.resources[path.toString()];
        callback();
    }

    protected _openWriteStream(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    {
        const resource = this.resources[path.toString()];
        if(resource === undefined)
            return callback(Errors.ResourceNotFound);
        
        const content = [];
        const stream = new VirtualFileWritable(content);
        stream.on('finish', () => {
            resource.content = content;
            resource.size = content.map((c) => c.length).reduce((s, n) => s + n, 0);
            _VirtualFileSystemResource.updateLastModified(resource);
        })
        callback(null, stream);
    }

    protected _openReadStream(path : Path, ctx : OpenReadStreamInfo, callback : ReturnCallback<Readable>) : void
    {
        const resource = this.resources[path.toString()];
        if(resource === undefined)
            return callback(Errors.ResourceNotFound);
        
        callback(null, new VirtualFileReadable(resource.content));
    }

    protected _move(pathFrom : Path, pathTo : Path, ctx : MoveInfo, callback : ReturnCallback<boolean>) : void
    {
        const from = pathFrom.toString();
        const to = pathTo.toString();
        const existed = !!this.resources[to];
        const fromExists = !!this.resources[from];

        if(!fromExists)
            return callback(Errors.ResourceNotFound);
        if(existed && !ctx.overwrite)
            return callback(Errors.ResourceAlreadyExists);

        this.resources[to] = this.resources[from];
        delete this.resources[from];

        callback(null, existed);
    }

    protected _size(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.size);
    }

    protected _lockManager(path : Path, ctx : LockManagerInfo, callback : ReturnCallback<ILockManager>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.locks);
    }

    protected _propertyManager(path : Path, ctx : PropertyManagerInfo, callback : ReturnCallback<IPropertyManager>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.props);
    }

    protected _readDir(path : Path, ctx : ReadDirInfo, callback : ReturnCallback<string[] | Path[]>) : void
    {
        const base = path.toString(true);
        const children = [];

        for(const subPath in this.resources)
        {
            if(subPath.indexOf(base) === 0)
            {
                const pSubPath = new Path(subPath);
                if(pSubPath.paths.length === path.paths.length + 1)
                    children.push(pSubPath);
            }
        }

        callback(null, children);
    }

    protected _creationDate(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.creationDate);
    }

    protected _lastModifiedDate(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.lastModifiedDate);
    }

    protected _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource.type);
    }
}
