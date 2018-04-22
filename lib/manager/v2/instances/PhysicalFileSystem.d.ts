/// <reference types="node" />
import { LocalPropertyManager, LastModifiedDateInfo, FileSystemSerializer, OpenWriteStreamInfo, PropertyManagerInfo, OpenReadStreamInfo, IPropertyManager, LocalLockManager, CreationDateInfo, LockManagerInfo, SimpleCallback, ReturnCallback, ResourceType, ILockManager, ReadDirInfo, CreateInfo, DeleteInfo, FileSystem, SizeInfo, MoveInfo, TypeInfo } from '../fileSystem/export';
import { Readable, Writable } from 'stream';
import { Path } from '../Path';
export declare class PhysicalFileSystemResource {
    props: LocalPropertyManager;
    locks: LocalLockManager;
    constructor(data?: PhysicalFileSystemResource);
}
export declare class PhysicalSerializer implements FileSystemSerializer {
    uid(): string;
    serialize(fs: PhysicalFileSystem, callback: ReturnCallback<any>): void;
    unserialize(serializedData: any, callback: ReturnCallback<FileSystem>): void;
}
export declare const PhysicalSerializerVersions: {
    versions: {
        '1.0.0': typeof PhysicalSerializer;
    };
    instances: FileSystemSerializer[];
};
export declare class PhysicalFileSystem extends FileSystem {
    rootPath: string;
    resources: {
        [path: string]: PhysicalFileSystemResource;
    };
    constructor(rootPath: string);
    protected getRealPath(path: Path): {
        realPath: string;
        resource: PhysicalFileSystemResource;
    };
    protected _create(path: Path, ctx: CreateInfo, _callback: SimpleCallback): void;
    protected _delete(path: Path, ctx: DeleteInfo, _callback: SimpleCallback): void;
    protected _openWriteStream(path: Path, ctx: OpenWriteStreamInfo, callback: ReturnCallback<Writable>): void;
    protected _openReadStream(path: Path, ctx: OpenReadStreamInfo, callback: ReturnCallback<Readable>): void;
    protected _move(pathFrom: Path, pathTo: Path, ctx: MoveInfo, callback: ReturnCallback<boolean>): void;
    protected _size(path: Path, ctx: SizeInfo, callback: ReturnCallback<number>): void;
    /**
     * Get a property of an existing resource (object property, not WebDAV property). If the resource doesn't exist, it is created.
     *
     * @param path Path of the resource
     * @param ctx Context of the method
     * @param propertyName Name of the property to get from the resource
     * @param callback Callback returning the property object of the resource
     */
    protected getPropertyFromResource(path: Path, ctx: any, propertyName: string, callback: ReturnCallback<any>): void;
    protected _lockManager(path: Path, ctx: LockManagerInfo, callback: ReturnCallback<ILockManager>): void;
    protected _propertyManager(path: Path, ctx: PropertyManagerInfo, callback: ReturnCallback<IPropertyManager>): void;
    protected _readDir(path: Path, ctx: ReadDirInfo, callback: ReturnCallback<string[] | Path[]>): void;
    protected getStatProperty(path: Path, ctx: any, propertyName: string, callback: ReturnCallback<any>): void;
    protected getStatDateProperty(path: Path, ctx: any, propertyName: string, callback: ReturnCallback<number>): void;
    protected _creationDate(path: Path, ctx: CreationDateInfo, callback: ReturnCallback<number>): void;
    protected _lastModifiedDate(path: Path, ctx: LastModifiedDateInfo, callback: ReturnCallback<number>): void;
    protected _type(path: Path, ctx: TypeInfo, callback: ReturnCallback<ResourceType>): void;
}
