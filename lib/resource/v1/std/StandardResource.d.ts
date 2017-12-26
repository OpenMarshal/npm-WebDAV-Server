/// <reference types="node" />
import { IResource, ReturnCallback, SimpleCallback, Return2Callback, ResourceType, ResourcePropertyValue } from '../IResource';
import { Readable, Writable } from 'stream';
import { FSManager, FSPath } from '../../../manager/v1/FSManager';
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { LockKind } from '../lock/LockKind';
import { LockBag } from '../lock/LockBag';
import { Lock } from '../lock/Lock';
export declare abstract class StandardResource implements IResource {
    static sizeOfSubFiles(resource: IResource, targetSource: boolean, callback: ReturnCallback<number>): void;
    dateLastModified: number;
    deleteOnMoved: boolean;
    dateCreation: number;
    properties: object;
    fsManager: FSManager;
    lockBag: LockBag;
    parent: IResource;
    constructor(parent: IResource, fsManager: FSManager);
    getAvailableLocks(callback: ReturnCallback<LockKind[]>): void;
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback): void;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<object>): void;
    abstract create(callback: SimpleCallback): any;
    abstract delete(callback: SimpleCallback): any;
    abstract rename(newName: string, callback: Return2Callback<string, string>): any;
    moveTo(parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback): void;
    abstract write(targetSource: boolean, callback: ReturnCallback<Writable>): any;
    abstract read(targetSource: boolean, callback: ReturnCallback<Readable>): any;
    abstract mimeType(targetSource: boolean, callback: ReturnCallback<string>): any;
    abstract size(targetSource: boolean, callback: ReturnCallback<number>): any;
    creationDate(callback: ReturnCallback<number>): void;
    lastModifiedDate(callback: ReturnCallback<number>): void;
    abstract webName(callback: ReturnCallback<string>): any;
    abstract type(callback: ReturnCallback<ResourceType>): any;
    abstract addChild(resource: IResource, callback: SimpleCallback): any;
    abstract removeChild(resource: IResource, callback: SimpleCallback): any;
    abstract getChildren(callback: ReturnCallback<IResource[]>): any;
    gateway?(arg: MethodCallArgs, path: FSPath, callback: (error: Error, resource?: IResource) => void): any;
    protected updateLastModified(): void;
    protected removeFromParent(callback: SimpleCallback): void;
    protected addToParent(parent: IResource, callback: SimpleCallback): void;
    static standardRemoveFromParent(resource: IResource, callback: SimpleCallback): void;
    static standardAddToParent(resource: IResource, parent: IResource, callback: SimpleCallback): void;
    static standardFindChildren(parent: IResource, predicate: (resource: IResource, callback: (error: Error, isMatching?: boolean) => void) => void, callback: ReturnCallback<IResource[]>): void;
    static standardFindChildByName(parent: IResource, name: string, callback: ReturnCallback<IResource>): void;
    static standardMoveByCopy(resource: IResource, parent: IResource, newName: string, overwrite: boolean, deleteSource: boolean, callback: ReturnCallback<IResource>): void;
    static standardMoveTo(resource: IResource, parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback): void;
    /**
     * @deprecated Prefer calling 'standardMoveByCopy(...)' instead to avoid compatibility issue between file systems.
     */
    static standardMoveWithoutCopy(resource: IResource, parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback): void;
    static standardMimeType(resource: IResource, targetSource: boolean, callback: ReturnCallback<string>): any;
    static standardMimeType(resource: IResource, targetSource: boolean, useWebName: boolean, callback: ReturnCallback<string>): any;
    static standardMimeType(resource: IResource, targetSource: boolean, defaultMimeType: string, callback: ReturnCallback<string>): any;
    static standardMimeType(resource: IResource, targetSource: boolean, defaultMimeType: string, useWebName: boolean, callback: ReturnCallback<string>): any;
}
