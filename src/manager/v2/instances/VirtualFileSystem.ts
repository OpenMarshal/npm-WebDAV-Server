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
    TypeInfo,
} from '../fileSystem/export'
import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { startsWith } from '../../../helper/JSCompatibility'
import { Errors } from '../../../Errors'
import { Path } from '../Path'

export class VirtualFileSystemResource
{
    props : LocalPropertyManager
    locks : LocalLockManager
    content : Buffer[]
    size : number
    lastModifiedDate : number
    creationDate : number
    type : ResourceType

    constructor(data : VirtualFileSystemResource | ResourceType)
    {
        let rs : VirtualFileSystemResource;
        if(data && (data as ResourceType).isFile !== undefined && (data as ResourceType).isDirectory !== undefined)
        {
            rs = {
                type: data as ResourceType
            } as VirtualFileSystemResource;
        }
        else
        {
            rs = data as VirtualFileSystemResource;
        }

        this.lastModifiedDate = rs.lastModifiedDate ? rs.lastModifiedDate : Date.now();
        this.creationDate = rs.creationDate ? rs.creationDate : Date.now();
        this.content = rs.content ? rs.content.map((o) => Buffer.from(o)) : [];
        this.props = new LocalPropertyManager(rs.props);
        this.locks = new LocalLockManager();
        this.size = rs.size ? rs.size : 0;
        this.type = rs.type ? rs.type : ResourceType.File;
    }

    static updateLastModified(r : VirtualFileSystemResource)
    {
        r.lastModifiedDate = Date.now();
    }
}

export class VirtualFileReadable extends Readable
{
    blockIndex : number

    constructor(public contents : any[][] | Buffer[] | Int8Array[])
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
    constructor(public contents : any[][] | Buffer[] | Int8Array[])
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
        return 'VirtualFSSerializer-1.0.0';
    }

    serialize(fs : VirtualFileSystem, callback : ReturnCallback<any>) : void
    {
        callback(null, {
            resources: fs.resources
        });
    }

    unserialize(serializedData : any, callback : ReturnCallback<FileSystem>) : void
    {
        // tslint:disable-next-line:no-use-before-declare
        const fs = new VirtualFileSystem();

        if(serializedData.resources)
        {
            for(const path in serializedData.resources)
                fs.resources[path] = new VirtualFileSystemResource(serializedData.resources[path]);
        }
        else
        {
            for(const path in serializedData)
                fs.resources[path] = new VirtualFileSystemResource(serializedData[path]);
        }

        callback(null, fs);
    }
}

export const VirtualSerializerVersions = {
    versions: {
        '1.0.0': VirtualSerializer
    },
    instances: [
        new VirtualSerializer()
    ] as FileSystemSerializer[]
}

export class VirtualFileSystem extends FileSystem
{
    resources : {
        [path : string] : VirtualFileSystemResource
    }

    constructor(serializer ?: FileSystemSerializer)
    {
        super(serializer ? serializer : new VirtualSerializer());

        this.resources = {
            '/': new VirtualFileSystemResource(ResourceType.Directory)
        };
    }
    
    protected _fastExistCheck(ctx : RequestContext, path : Path, callback : (exists : boolean) => void) : void
    {
        callback(this.resources[path.toString()] !== undefined);
    }

    protected _create(path : Path, ctx : CreateInfo, callback : SimpleCallback) : void
    {
        this.resources[path.toString()] = new VirtualFileSystemResource(ctx.type);
        callback();
    }

    protected _delete(path : Path, ctx : DeleteInfo, callback : SimpleCallback) : void
    {
        const sPath = path.toString(true);
        for(const path in this.resources)
        {
            if(startsWith(path, sPath))
                delete this.resources[path];
        }

        delete this.resources[path.toString()];
        
        callback();
    }

    protected _openWriteStream(path : Path, ctx : OpenWriteStreamInfo, callback : ReturnCallback<Writable>) : void
    {
        const resource = this.resources[path.toString()];
        if(resource === undefined)
            return callback(Errors.ResourceNotFound);
        
        const content : Buffer[] = [];
        const stream = new VirtualFileWritable(content);
        stream.on('finish', () => {
            resource.content = content;
            resource.size = content.map((c) => c.length).reduce((s, n) => s + n, 0);
            VirtualFileSystemResource.updateLastModified(resource);
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

    protected _size(path : Path, ctx : SizeInfo, callback : ReturnCallback<number>) : void
    {
        this.getPropertyFromResource(path, ctx, 'size', callback);
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
        const base = path.toString(true);
        const children = [];

        for(const subPath in this.resources)
        {
            if(startsWith(subPath, base))
            {
                const pSubPath = new Path(subPath);
                if(pSubPath.paths.length === path.paths.length + 1)
                    children.push(pSubPath);
            }
        }

        callback(null, children);
    }
    
    /**
     * Get a property of an existing resource (object property, not WebDAV property). If the resource doesn't exist, it is created.
     * 
     * @param path Path of the resource
     * @param ctx Context of the method
     * @param propertyName Name of the property to get from the resource
     * @param callback Callback returning the property object of the resource
     */
    protected getPropertyFromResource(path : Path, ctx : TypeInfo, propertyName : string, callback : ReturnCallback<any>) : void
    {
        const resource = this.resources[path.toString()];
        if(!resource)
            return callback(Errors.ResourceNotFound);
        
        callback(null, resource[propertyName]);
    }

    protected _creationDate(path : Path, ctx : CreationDateInfo, callback : ReturnCallback<number>) : void
    {
        this.getPropertyFromResource(path, ctx, 'creationDate', callback);
    }

    protected _lastModifiedDate(path : Path, ctx : LastModifiedDateInfo, callback : ReturnCallback<number>) : void
    {
        this.getPropertyFromResource(path, ctx, 'lastModifiedDate', callback);
    }

    protected _type(path : Path, ctx : TypeInfo, callback : ReturnCallback<ResourceType>) : void
    {
        this.getPropertyFromResource(path, ctx, 'type', callback);
    }
}
