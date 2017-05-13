import { LockKind } from './LockKind';
import { Lock } from './Lock';
export declare class LockBag {
    locks: Lock[];
    constructor();
    getLocks(lockKind: LockKind): Lock[];
    setLock(lock: Lock): boolean;
    removeLock(uuid: string, owner: string): void;
    canRemoveLock(uuid: string, owner: string): boolean;
    canLock(lockKind: LockKind): boolean;
    private notExpired(l);
    private cleanLocks();
}
