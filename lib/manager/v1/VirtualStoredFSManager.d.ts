/// <reference types="node" />
import { IResource, ResourceType, ReturnCallback, SimpleCallback } from '../../resource/v1/IResource';
import { Readable, Writable } from 'stream';
import { SerializedObject } from './ISerializer';
import { FSManager } from './FSManager';
export interface IVirtualStoredContentManager {
    uid: string;
    initialize(callback: (error: Error) => void): any;
    read(contentUid: string, callback: ReturnCallback<Readable>): any;
    write(contentUid: string, callback: ReturnCallback<Writable>): any;
    deallocate(contentId: string, callback: SimpleCallback): any;
    allocate(callback: ReturnCallback<string>): any;
    allocate(options: any, callback: ReturnCallback<string>): any;
}
export declare abstract class VirtualStoredContentManager implements IVirtualStoredContentManager {
    uid: string;
    abstract initialize(callback: (error: Error) => void): any;
    abstract read(contentUid: string, callback: ReturnCallback<Readable>): any;
    abstract write(contentUid: string, callback: ReturnCallback<Writable>): any;
    protected abstract _allocate(options: any, callback: ReturnCallback<string>): any;
    abstract deallocate(contentId: string, callback: SimpleCallback): any;
    allocate(callback: ReturnCallback<string>): any;
    allocate(options: any, callback: ReturnCallback<string>): any;
}
export interface IVirtualStoredContentManagerMiddleware {
    readStream(uid: string, stream: Readable, callback: (stream: Readable) => void): any;
    writeStream(uid: string, stream: Writable, callback: (stream: Writable) => void): any;
}
export declare class SimpleVirtualStoredContentManager extends VirtualStoredContentManager {
    storeFolderPath: string;
    middleware?: IVirtualStoredContentManagerMiddleware;
    initialized: boolean;
    uid: string;
    cid: number;
    constructor(storeFolderPath: string, middleware?: IVirtualStoredContentManagerMiddleware);
    initialize(callback: (error: Error) => void): void;
    read(contentUid: string, _callback: ReturnCallback<Readable>): void;
    write(contentUid: string, _callback: ReturnCallback<Writable>): void;
    deallocate(uid: string, callback: SimpleCallback): void;
    protected _allocate(options: any, _callback: ReturnCallback<string>): void;
}
export declare class VirtualStoredFSManager implements FSManager {
    contentManager: IVirtualStoredContentManager;
    uid: string;
    constructor(contentManager: IVirtualStoredContentManager);
    initialize(callback: (error: Error) => void): void;
    serialize(resource: any, obj: SerializedObject): object;
    unserialize(data: any, obj: SerializedObject): IResource;
    newResource(fullPath: string, name: string, type: ResourceType, parent: IResource): IResource;
}
