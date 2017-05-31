/// <reference types="node" />
import { IResource, ResourceType, ReturnCallback } from '../resource/IResource';
import { SerializedObject } from './ISerializer';
import { FSManager } from './FSManager';
import { Readable, Writable } from 'stream';
export interface IVirtualStoredContentManager {
    uid: string;
    initialize(callback: (error: Error) => void): any;
    read(contentUid: string, callback: ReturnCallback<Readable>): any;
    write(contentUid: string, callback: ReturnCallback<Writable>): any;
    allocate(callback: ReturnCallback<string>): any;
    allocate(options: any, callback: ReturnCallback<string>): any;
}
export declare abstract class VirtualStoredContentManager implements IVirtualStoredContentManager {
    uid: string;
    abstract initialize(callback: (error: Error) => void): any;
    abstract read(contentUid: string, callback: ReturnCallback<Readable>): any;
    abstract write(contentUid: string, callback: ReturnCallback<Writable>): any;
    protected abstract _allocate(options: any, callback: ReturnCallback<string>): any;
    allocate(callback: ReturnCallback<string>): any;
    allocate(options: any, callback: ReturnCallback<string>): any;
}
export declare class SimpleVirtualStoredContentManager extends VirtualStoredContentManager {
    storeFolderPath: string;
    initialized: boolean;
    uid: string;
    cid: number;
    constructor(storeFolderPath: string);
    initialize(callback: (error: Error) => void): void;
    read(contentUid: string, _callback: ReturnCallback<Readable>): void;
    write(contentUid: string, _callback: ReturnCallback<Writable>): void;
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
