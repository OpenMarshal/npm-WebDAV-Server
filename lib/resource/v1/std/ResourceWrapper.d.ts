/// <reference types="node" />
import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType, ResourcePropertyValue } from '../IResource';
import { Readable, Writable } from 'stream';
import { FSManager, FSPath } from '../../../manager/v1/FSManager';
import { RequestContext, MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { LockKind } from '../lock/LockKind';
import { Lock } from '../lock/Lock';
export interface IWrappableResource<T> extends IResource {
    parent: IResource;
    fsManager: FSManager;
    create(callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    delete(callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    moveTo(parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    rename(newName: string, callback: Return2Callback<string, string>, ctx?: RequestContext, data?: T): any;
    write(targetSource: boolean, callback: ReturnCallback<Writable>, finalSize?: number, ctx?: RequestContext, data?: T): any;
    read(targetSource: boolean, callback: ReturnCallback<Readable>, ctx?: RequestContext, data?: T): any;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>, ctx?: RequestContext, data?: T): any;
    size(targetSource: boolean, callback: ReturnCallback<number>, ctx?: RequestContext, data?: T): any;
    getLocks(callback: ReturnCallback<Lock[]>, ctx?: RequestContext, data?: T): any;
    setLock(lock: Lock, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    removeLock(uuid: string, callback: ReturnCallback<boolean>, ctx?: RequestContext, data?: T): any;
    getAvailableLocks(callback: ReturnCallback<LockKind[]>, ctx?: RequestContext, data?: T): any;
    getLock(uuid: string, callback: ReturnCallback<Lock>, ctx?: RequestContext, data?: T): any;
    addChild(resource: IResource, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    removeChild(resource: IResource, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    getChildren(callback: ReturnCallback<IResource[]>, ctx?: RequestContext, data?: T): any;
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>, ctx?: RequestContext, data?: T): any;
    removeProperty(name: string, callback: SimpleCallback, ctx?: RequestContext, data?: T): any;
    getProperties(callback: ReturnCallback<object>, ctx?: RequestContext, data?: T): any;
    creationDate(callback: ReturnCallback<number>, ctx?: RequestContext, data?: T): any;
    lastModifiedDate(callback: ReturnCallback<number>, ctx?: RequestContext, data?: T): any;
    webName(callback: ReturnCallback<string>, ctx?: RequestContext, data?: T): any;
    displayName?(callback: ReturnCallback<string>, ctx?: RequestContext, data?: T): any;
    type(callback: ReturnCallback<ResourceType>, ctx?: RequestContext, data?: T): any;
    gateway?(arg: RequestContext, path: FSPath, callback: (error: Error, resource?: IResource) => void): any;
}
export declare class SimpleResourceWrapper<T> implements IResource {
    resource: IWrappableResource<T>;
    data?: T;
    get fsManager(): FSManager;
    set fsManager(fsManager: FSManager);
    get parent(): IResource;
    set parent(parent: IResource);
    get _isWrapper(): boolean;
    constructor(resource: IWrappableResource<T>, data?: T);
    create(callback: SimpleCallback): void;
    delete(callback: SimpleCallback): void;
    moveTo(parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback): void;
    rename(newName: string, callback: Return2Callback<string, string>): void;
    write(targetSource: boolean, callback: ReturnCallback<Writable>, finalSize?: number): void;
    read(targetSource: boolean, callback: ReturnCallback<Readable>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getAvailableLocks(callback: ReturnCallback<LockKind[]>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback): void;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<object>): void;
    creationDate(callback: ReturnCallback<number>): void;
    lastModifiedDate(callback: ReturnCallback<number>): void;
    webName(callback: ReturnCallback<string>): void;
    type(callback: ReturnCallback<ResourceType>): void;
    displayName(callback: ReturnCallback<string>): void;
    get gateway(): (arg: MethodCallArgs, path: FSPath, callback: (error: Error, resource?: IResource) => void) => any;
    protected _invoke(name: string, args: any[]): void;
}
export declare class ResourceWrapper<T> extends SimpleResourceWrapper<T> {
    constructor(resource: IWrappableResource<T>, ctx?: RequestContext, data?: T);
    protected _invoke(name: string, args: any[]): void;
}
