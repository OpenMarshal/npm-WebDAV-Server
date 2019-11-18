/// <reference types="node" />
import { ReturnCallback, SimpleCallback, Return2Callback, OpenWriteStreamMode, SubTree, ResourceType } from './CommonTypes';
import { Readable, Writable } from 'stream';
import { IPropertyManager } from './PropertyManager';
import { RequestContext } from '../../../server/v2/RequestContext';
import { ILockManagerAsync } from './LockManager';
import { FileSystem } from './FileSystem';
import { LockKind } from '../../../resource/v2/lock/LockKind';
import { Lock } from '../../../resource/v2/lock/Lock';
import { Path } from '../Path';
export declare class Resource {
    fs: FileSystem;
    context: RequestContext;
    path: Path;
    constructor(path: Path | string, fs: FileSystem, context: RequestContext);
    delete(callback: SimpleCallback): void;
    delete(depth: number, callback: SimpleCallback): void;
    openWriteStream(callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(targetSource: boolean, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(targetSource: boolean, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(mode: OpenWriteStreamMode, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(mode: OpenWriteStreamMode, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(mode: OpenWriteStreamMode, targetSource: boolean, callback: Return2Callback<Writable, boolean>): void;
    openWriteStream(mode: OpenWriteStreamMode, targetSource: boolean, estimatedSize: number, callback: Return2Callback<Writable, boolean>): void;
    openReadStream(callback: ReturnCallback<Readable>): void;
    openReadStream(estimatedSize: number, callback: ReturnCallback<Readable>): void;
    openReadStream(targetSource: boolean, callback: ReturnCallback<Readable>): void;
    openReadStream(targetSource: boolean, estimatedSize: number, callback: ReturnCallback<Readable>): void;
    copy(pathTo: Path | string, callback: ReturnCallback<boolean>): void;
    copy(pathTo: Path | string, depth: number, callback: ReturnCallback<boolean>): void;
    copy(pathTo: Path | string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    copy(pathTo: Path | string, overwrite: boolean, depth: number, callback: ReturnCallback<boolean>): void;
    mimeType(callback: ReturnCallback<string>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(callback: ReturnCallback<number>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    addSubTree(subTree: SubTree, callback: SimpleCallback): any;
    addSubTree(resourceType: ResourceType, callback: SimpleCallback): any;
    create(type: ResourceType, callback: SimpleCallback): void;
    create(type: ResourceType, createIntermediates: boolean, callback: SimpleCallback): void;
    etag(callback: ReturnCallback<string>): void;
    move(pathTo: Path | string, callback: ReturnCallback<boolean>): void;
    move(pathTo: Path | string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    rename(newName: string, callback: ReturnCallback<boolean>): void;
    rename(newName: string, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    availableLocks(callback: ReturnCallback<LockKind[]>): void;
    lockManager(callback: ReturnCallback<ILockManagerAsync>): void;
    propertyManager(callback: ReturnCallback<IPropertyManager>): void;
    readDir(callback: ReturnCallback<string[]>): void;
    readDir(retrieveExternalFiles: boolean, callback: ReturnCallback<string[]>): void;
    creationDate(callback: ReturnCallback<number>): void;
    lastModifiedDate(callback: ReturnCallback<number>): void;
    webName(callback: ReturnCallback<string>): void;
    displayName(callback: ReturnCallback<string>): void;
    type(callback: ReturnCallback<ResourceType>): void;
    listDeepLocks(callback: ReturnCallback<{
        [path: string]: Lock[];
    }>): any;
    listDeepLocks(depth: number, callback: ReturnCallback<{
        [path: string]: Lock[];
    }>): any;
    isLocked(callback: ReturnCallback<boolean>): any;
    isLocked(depth: number, callback: ReturnCallback<boolean>): any;
    deleteAsync(): Promise<void>;
    deleteAsync(depth: number): Promise<void>;
    openWriteStreamAsync(): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(targetSource: boolean): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(targetSource: boolean, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(mode: OpenWriteStreamMode): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(mode: OpenWriteStreamMode, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(mode: OpenWriteStreamMode, targetSource: boolean): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openWriteStreamAsync(mode: OpenWriteStreamMode, targetSource: boolean, estimatedSize: number): Promise<{
        stream: Writable;
        created: boolean;
    }>;
    openReadStreamAsync(): Promise<Readable>;
    openReadStreamAsync(estimatedSize: number): Promise<Readable>;
    openReadStreamAsync(targetSource: boolean): Promise<Readable>;
    openReadStreamAsync(targetSource: boolean, estimatedSize: number): Promise<Readable>;
    copyAsync(pathTo: Path | string): Promise<boolean>;
    copyAsync(pathTo: Path | string, depth: number): Promise<boolean>;
    copyAsync(pathTo: Path | string, overwrite: boolean): Promise<boolean>;
    copyAsync(pathTo: Path | string, overwrite: boolean, depth: number): Promise<boolean>;
    mimeTypeAsync(): Promise<string>;
    mimeTypeAsync(targetSource: boolean): Promise<string>;
    sizeAsync(): Promise<number>;
    sizeAsync(targetSource: boolean): Promise<number>;
    addSubTreeAsync(subTree: SubTree, callback: SimpleCallback): any;
    addSubTreeAsync(resourceType: ResourceType, callback: SimpleCallback): any;
    createAsync(type: ResourceType): Promise<void>;
    createAsync(type: ResourceType, createIntermediates: boolean): Promise<void>;
    etagAsync(): Promise<string>;
    moveAsync(pathTo: Path | string): Promise<boolean>;
    moveAsync(pathTo: Path | string, overwrite: boolean): Promise<boolean>;
    renameAsync(newName: string): Promise<boolean>;
    renameAsync(newName: string, overwrite: boolean): Promise<boolean>;
    availableLocksAsync(): Promise<LockKind[]>;
    lockManagerAsync(): Promise<ILockManagerAsync>;
    propertyManagerAsync(): Promise<IPropertyManager>;
    readDirAsync(): Promise<string[]>;
    readDirAsync(retrieveExternalFiles: boolean): Promise<string[]>;
    creationDateAsync(): Promise<number>;
    lastModifiedDateAsync(): Promise<number>;
    webNameAsync(): Promise<string>;
    displayNameAsync(): Promise<string>;
    typeAsync(): Promise<ResourceType>;
    listDeepLocksAsync(): Promise<{
        [path: string]: Lock[];
    }>;
    listDeepLocksAsync(depth: number): Promise<{
        [path: string]: Lock[];
    }>;
    isLockedAsync(): Promise<boolean>;
    isLockedAsync(depth: number): Promise<boolean>;
}
