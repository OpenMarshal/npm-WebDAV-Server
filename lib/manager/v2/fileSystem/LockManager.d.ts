import { ReturnCallback, SimpleCallback } from './CommonTypes';
import { Lock } from '../../../resource/v2/lock/Lock';
export interface ILockManager {
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    refresh(uuid: string, timeoutSeconds: number, callback: ReturnCallback<Lock>): void;
}
export interface ILockManagerAsync extends ILockManager {
    getLocksAsync(): Promise<Lock[]>;
    setLockAsync(lock: Lock): Promise<void>;
    removeLockAsync(uuid: string): Promise<boolean>;
    getLockAsync(uuid: string): Promise<Lock>;
    refreshAsync(uuid: string, timeoutSeconds: number): Promise<Lock>;
}
export declare class LocalLockManager implements ILockManager {
    locks: Lock[];
    constructor(serializedData?: any);
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    refresh(uuid: string, timeoutSeconds: number, callback: ReturnCallback<Lock>): void;
}
