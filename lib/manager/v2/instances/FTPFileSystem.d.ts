/// <reference types="ftp" />
/// <reference types="node" />
import { LocalPropertyManager, LastModifiedDateInfo, FileSystemSerializer, OpenWriteStreamInfo, PropertyManagerInfo, OpenReadStreamInfo, IPropertyManager, LocalLockManager, CreationDateInfo, LockManagerInfo, SimpleCallback, ReturnCallback, ResourceType, ILockManager, ReadDirInfo, CreateInfo, DeleteInfo, FileSystem, SizeInfo, MoveInfo, TypeInfo } from '../fileSystem/export';
import { Readable, Writable } from 'stream';
import { Path } from '../Path';
import * as Client from 'ftp';
export declare class _FTPFileSystemResource {
    props: LocalPropertyManager;
    locks: LocalLockManager;
    type: ResourceType;
    constructor(data?: _FTPFileSystemResource);
}
export declare class FTPSerializer implements FileSystemSerializer {
    uid(): string;
    serialize(fs: FTPFileSystem, callback: ReturnCallback<any>): void;
    unserialize(serializedData: any, callback: ReturnCallback<FileSystem>): void;
}
export declare class FTPFileSystem extends FileSystem {
    config: Client.Options;
    resources: {
        [path: string]: _FTPFileSystemResource;
    };
    constructor(config: Client.Options);
    protected getRealPath(path: Path): {
        realPath: string;
        resource: _FTPFileSystemResource;
    };
    protected connect(callback: (client: Client) => void): void;
    protected _create(path: Path, ctx: CreateInfo, _callback: SimpleCallback): void;
    protected _delete(path: Path, ctx: DeleteInfo, _callback: SimpleCallback): void;
    protected _openWriteStream(path: Path, ctx: OpenWriteStreamInfo, callback: ReturnCallback<Writable>): void;
    protected _openReadStream(path: Path, ctx: OpenReadStreamInfo, callback: ReturnCallback<Readable>): void;
    protected _move(pathFrom: Path, pathTo: Path, ctx: MoveInfo, callback: ReturnCallback<boolean>): void;
    protected _size(path: Path, ctx: SizeInfo, callback: ReturnCallback<number>): void;
    protected _lockManager(path: Path, ctx: LockManagerInfo, callback: ReturnCallback<ILockManager>): void;
    protected _propertyManager(path: Path, ctx: PropertyManagerInfo, callback: ReturnCallback<IPropertyManager>): void;
    protected _readDir(path: Path, ctx: ReadDirInfo, callback: ReturnCallback<string[] | Path[]>): void;
    protected _creationDate(path: Path, ctx: CreationDateInfo, callback: ReturnCallback<number>): void;
    protected _lastModifiedDate(path: Path, ctx: LastModifiedDateInfo, callback: ReturnCallback<number>): void;
    protected _type(path: Path, ctx: TypeInfo, callback: ReturnCallback<ResourceType>): void;
}
