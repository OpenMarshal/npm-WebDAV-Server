import { LockKind, Lock, LockBag } from './Lock';
import { FSManager, FSPath } from '../manager/FSManager';
export interface SimpleCallback {
    (error: Error): void;
}
export interface ReturnCallback<T> {
    (error: Error, data: T): void;
}
export interface Return2Callback<T, Q> {
    (error: Error, x: T, y: Q): void;
}
export declare class ResourceType {
    isFile: boolean;
    isDirectory: boolean;
    constructor(isFile: boolean, isDirectory: boolean);
    static File: ResourceType;
    static Directory: ResourceType;
    static Hibrid: ResourceType;
    static NoResource: ResourceType;
}
export interface IResource {
    parent: IResource;
    fsManager: FSManager;
    create(callback: SimpleCallback): any;
    delete(callback: SimpleCallback): any;
    moveTo(to: FSPath, callback: Return2Callback<FSPath, FSPath>): any;
    rename(newName: string, callback: Return2Callback<string, string>): any;
    isSame(resource: IResource, callback: ReturnCallback<boolean>): any;
    isOnTheSameFSWith(resource: IResource, callback: ReturnCallback<boolean>): any;
    append(data: Int8Array, callback: SimpleCallback): any;
    write(data: Int8Array, callback: SimpleCallback): any;
    read(callback: ReturnCallback<Int8Array>): any;
    mimeType(callback: ReturnCallback<string>): any;
    size(callback: ReturnCallback<number>): any;
    getLocks(lockKind: LockKind, callback: ReturnCallback<Array<Lock>>): any;
    setLock(lock: Lock, callback: SimpleCallback): any;
    removeLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): any;
    canLock(lockKind: LockKind, callback: ReturnCallback<boolean>): any;
    getAvailableLocks(callback: ReturnCallback<Array<LockKind>>): any;
    canRemoveLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): any;
    addChild(resource: IResource, callback: SimpleCallback): any;
    removeChild(resource: IResource, callback: SimpleCallback): any;
    getChildren(callback: ReturnCallback<Array<IResource>>): any;
    setProperty(name: string, value: string, callback: SimpleCallback): any;
    getProperty(name: string, callback: ReturnCallback<string>): any;
    removeProperty(name: string, callback: SimpleCallback): any;
    getProperties(callback: ReturnCallback<Object>): any;
    creationDate(callback: ReturnCallback<number>): any;
    lastModifiedDate(callback: ReturnCallback<number>): any;
    webName(callback: ReturnCallback<string>): any;
    type(callback: ReturnCallback<ResourceType>): any;
}
export declare abstract class StandardResource implements IResource {
    properties: Object;
    fsManager: FSManager;
    lockBag: LockBag;
    parent: IResource;
    dateCreation: number;
    dateLastModified: number;
    constructor(parent: IResource, fsManager: FSManager);
    protected updateLastModified(): void;
    protected removeFromParent(callback: SimpleCallback): void;
    isSame(resource: IResource, callback: ReturnCallback<boolean>): void;
    isOnTheSameFSWith(resource: IResource, callback: ReturnCallback<boolean>): void;
    getAvailableLocks(callback: ReturnCallback<Array<LockKind>>): void;
    getLocks(lockKind: LockKind, callback: ReturnCallback<Array<Lock>>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): void;
    canRemoveLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): void;
    canLock(lockKind: LockKind, callback: ReturnCallback<boolean>): void;
    setProperty(name: string, value: string, callback: SimpleCallback): void;
    getProperty(name: string, callback: ReturnCallback<string>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<Object>): void;
    abstract create(callback: SimpleCallback): any;
    abstract delete(callback: SimpleCallback): any;
    abstract moveTo(to: FSPath, callback: Return2Callback<FSPath, FSPath>): any;
    abstract rename(newName: string, callback: Return2Callback<string, string>): any;
    abstract append(data: Int8Array, callback: SimpleCallback): any;
    abstract write(data: Int8Array, callback: SimpleCallback): any;
    abstract read(callback: ReturnCallback<Int8Array>): any;
    abstract mimeType(callback: ReturnCallback<string>): any;
    abstract size(callback: ReturnCallback<number>): any;
    creationDate(callback: ReturnCallback<number>): void;
    lastModifiedDate(callback: ReturnCallback<number>): void;
    abstract webName(callback: ReturnCallback<string>): any;
    abstract type(callback: ReturnCallback<ResourceType>): any;
    abstract addChild(resource: IResource, callback: SimpleCallback): any;
    abstract removeChild(resource: IResource, callback: SimpleCallback): any;
    abstract getChildren(callback: ReturnCallback<Array<IResource>>): any;
    static sizeOfSubFiles(resource: IResource, callback: ReturnCallback<number>): void;
}
