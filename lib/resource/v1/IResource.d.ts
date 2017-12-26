/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { FSManager, FSPath } from '../../manager/v1/FSManager';
import { RequestContext } from '../../server/v1/MethodCallArgs';
import { XMLElement } from 'xml-js-builder';
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
    create(callback: SimpleCallback, arg?: RequestContext): any;
    delete(callback: SimpleCallback, arg?: RequestContext): any;
    moveTo(parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback, arg?: RequestContext): any;
    rename(newName: string, callback: Return2Callback<string, string>, arg?: RequestContext): any;
    write(targetSource: boolean, callback: ReturnCallback<Writable>, finalSize?: number, arg?: RequestContext): any;
    read(targetSource: boolean, callback: ReturnCallback<Readable>, arg?: RequestContext): any;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>, arg?: RequestContext): any;
    size(targetSource: boolean, callback: ReturnCallback<number>, arg?: RequestContext): any;
    getLocks(callback: ReturnCallback<Lock[]>, arg?: RequestContext): any;
    setLock(lock: Lock, callback: SimpleCallback, arg?: RequestContext): any;
    removeLock(uuid: string, callback: ReturnCallback<boolean>, arg?: RequestContext): any;
    getAvailableLocks(callback: ReturnCallback<LockKind[]>, arg?: RequestContext): any;
    getLock(uuid: string, callback: ReturnCallback<Lock>, arg?: RequestContext): any;
    addChild(resource: IResource, callback: SimpleCallback, arg?: RequestContext): any;
    removeChild(resource: IResource, callback: SimpleCallback, arg?: RequestContext): any;
    getChildren(callback: ReturnCallback<IResource[]>, arg?: RequestContext): any;
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback, arg?: RequestContext): any;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>, arg?: RequestContext): any;
    removeProperty(name: string, callback: SimpleCallback, arg?: RequestContext): any;
    getProperties(callback: ReturnCallback<object>, arg?: RequestContext): any;
    creationDate(callback: ReturnCallback<number>, arg?: RequestContext): any;
    lastModifiedDate(callback: ReturnCallback<number>, arg?: RequestContext): any;
    webName(callback: ReturnCallback<string>, arg?: RequestContext): any;
    displayName?(callback: ReturnCallback<string>, arg?: RequestContext): any;
    type(callback: ReturnCallback<ResourceType>, arg?: RequestContext): any;
    gateway?(arg: RequestContext, path: FSPath, callback: (error: Error, resource?: IResource) => void): any;
}
