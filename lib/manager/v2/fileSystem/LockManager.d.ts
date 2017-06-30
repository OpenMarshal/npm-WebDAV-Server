import { Lock } from '../../../resource/lock/Lock';
import { ReturnCallback, SimpleCallback } from './CommonTypes';
export interface ILockManager {
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    refresh(uuid: string, timeout: number, callback: ReturnCallback<Lock>): void;
}
export declare class LocalLockManager implements ILockManager {
    locks: Lock[];
    constructor(serializedData?: any);
    getLocks(callback: ReturnCallback<Lock[]>): void;
    setLock(lock: Lock, callback: SimpleCallback): void;
    removeLock(uuid: string, callback: ReturnCallback<boolean>): void;
    getLock(uuid: string, callback: ReturnCallback<Lock>): void;
    refresh(uuid: string, timeout: number, callback: ReturnCallback<Lock>): void;
}
