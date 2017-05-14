import { FSManager, FSPath } from '../manager/FSManager';
import { XMLElement } from '../helper/XML';
import { LockKind } from './lock/LockKind';
import { Lock } from './lock/Lock';
export declare type SimpleCallback = (error: Error) => void;
export declare type ReturnCallback<T> = (error: Error, data: T) => void;
export declare type Return2Callback<T, Q> = (error: Error, x: T, y: Q) => void;
export declare type ResourcePropertyValue = string | XMLElement | XMLElement[];
export declare class ResourceType {
    isFile: boolean;
    isDirectory: boolean;
    static File: ResourceType;
    static Directory: ResourceType;
    static Hibrid: ResourceType;
    static NoResource: ResourceType;
    constructor(isFile: boolean, isDirectory: boolean);
}
export declare abstract class ETag {
    static createETag(date: number | string): string;
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
    getLocks(lockKind: LockKind, callback: ReturnCallback<Lock[]>): any;
    setLock(lock: Lock, callback: SimpleCallback): any;
    removeLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): any;
    canLock(lockKind: LockKind, callback: ReturnCallback<boolean>): any;
    getAvailableLocks(callback: ReturnCallback<LockKind[]>): any;
    canRemoveLock(uuid: string, owner: string, callback: ReturnCallback<boolean>): any;
    addChild(resource: IResource, callback: SimpleCallback): any;
    removeChild(resource: IResource, callback: SimpleCallback): any;
    getChildren(callback: ReturnCallback<IResource[]>): any;
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback): any;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>): any;
    removeProperty(name: string, callback: SimpleCallback): any;
    getProperties(callback: ReturnCallback<object>): any;
    creationDate(callback: ReturnCallback<number>): any;
    lastModifiedDate(callback: ReturnCallback<number>): any;
    webName(callback: ReturnCallback<string>): any;
    type(callback: ReturnCallback<ResourceType>): any;
}
