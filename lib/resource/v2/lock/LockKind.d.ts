import { LockScope } from './LockScope';
import { LockType } from './LockType';
export declare class LockKind {
    scope: LockScope;
    type: LockType;
    /**
     * Timeout in seconds
     */
    timeout: number;
    constructor(scope: LockScope, type: LockType, timeoutSeconds?: number);
    isSimilar(lockKind: LockKind): boolean;
}
