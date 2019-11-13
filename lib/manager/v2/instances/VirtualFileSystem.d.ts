/// <reference types="node" />
import { LocalPropertyManager, LastModifiedDateInfo, FileSystemSerializer, OpenWriteStreamInfo, PropertyManagerInfo, OpenReadStreamInfo, IPropertyManager, LocalLockManager, CreationDateInfo, LockManagerInfo, SimpleCallback, ReturnCallback, ResourceType, ILockManager, ReadDirInfo, CreateInfo, DeleteInfo, FileSystem, SizeInfo, TypeInfo } from '../fileSystem/export';
import { Readable, Writable } from 'stream';
import { RequestContext } from '../../../server/v2/RequestContext';
import { Path } from '../Path';
export declare class VirtualFileSystemResource {
    props: LocalPropertyManager;
    locks: LocalLockManager;
    content: Buffer[];
    size: number;
    lastModifiedDate: number;
    creationDate: number;
    type: ResourceType;
    constructor(data: VirtualFileSystemResource | ResourceType);
    static updateLastModified(r: VirtualFileSystemResource): void;
}
export declare class VirtualFileReadable extends Readable {
    contents: any[][] | Buffer[] | Int8Array[];
    blockIndex: number;
    constructor(contents: any[][] | Buffer[] | Int8Array[]);
    _read(size: number): void;
}
export declare class VirtualFileWritable extends Writable {
    contents: any[][] | Buffer[] | Int8Array[];
    constructor(contents: any[][] | Buffer[] | Int8Array[]);
    _write(chunk: Buffer | string | any, encoding: string, callback: (error: Error) => void): void;
}
export declare class VirtualSerializer implements FileSystemSerializer {
    uid(): string;
    serialize(fs: VirtualFileSystem, callback: ReturnCallback<any>): void;
    unserialize(serializedData: any, callback: ReturnCallback<FileSystem>): void;
}
export declare const VirtualSerializerVersions: {
    versions: {
        '1.0.0': typeof VirtualSerializer;
    };
    instances: FileSystemSerializer[];
};
export declare class VirtualFileSystem extends FileSystem {
    resources: {
        [path: string]: VirtualFileSystemResource;
    };
    constructor(serializer?: FileSystemSerializer);
    protected _fastExistCheck(ctx: RequestContext, path: Path, callback: (exists: boolean) => void): void;
    protected _create(path: Path, ctx: CreateInfo, callback: SimpleCallback): void;
    protected _delete(path: Path, ctx: DeleteInfo, callback: SimpleCallback): void;
    protected _openWriteStream(path: Path, ctx: OpenWriteStreamInfo, callback: ReturnCallback<Writable>): void;
    protected _openReadStream(path: Path, ctx: OpenReadStreamInfo, callback: ReturnCallback<Readable>): void;
    protected _size(path: Path, ctx: SizeInfo, callback: ReturnCallback<number>): void;
    protected _lockManager(path: Path, ctx: LockManagerInfo, callback: ReturnCallback<ILockManager>): void;
    protected _propertyManager(path: Path, ctx: PropertyManagerInfo, callback: ReturnCallback<IPropertyManager>): void;
    protected _readDir(path: Path, ctx: ReadDirInfo, callback: ReturnCallback<string[] | Path[]>): void;
    /**
     * Get a property of an existing resource (object property, not WebDAV property). If the resource doesn't exist, it is created.
     *
     * @param path Path of the resource
     * @param ctx Context of the method
     * @param propertyName Name of the property to get from the resource
     * @param callback Callback returning the property object of the resource
     */
    protected getPropertyFromResource(path: Path, ctx: TypeInfo, propertyName: string, callback: ReturnCallback<any>): void;
    protected _creationDate(path: Path, ctx: CreationDateInfo, callback: ReturnCallback<number>): void;
    protected _lastModifiedDate(path: Path, ctx: LastModifiedDateInfo, callback: ReturnCallback<number>): void;
    protected _type(path: Path, ctx: TypeInfo, callback: ReturnCallback<ResourceType>): void;
}
