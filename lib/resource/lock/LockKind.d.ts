import { LockScope } from './LockScope';
import { LockType } from './LockType';
export declare class LockKind {
    scope: LockScope;
    type: LockType;
    timeout: number;
    constructor(scope: LockScope, type: LockType, timeout?: number);
    isSimilar(lockKind: LockKind): boolean;
}
