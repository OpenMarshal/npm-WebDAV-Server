import { LockKind } from './LockKind';
import { LockType } from './LockType';
import { Lock } from './Lock';
export declare class LockBag {
    protected locks: Lock[];
    constructor();
    getLocks(lockType?: LockType): Lock[];
    getLock(uuid: string): Lock;
    setLock(lock: Lock): boolean;
    removeLock(uuid: string): void;
    canLock(lockKind: LockKind): boolean;
    protected notExpired(lock: Lock): boolean;
    protected cleanLocks(): void;
}
