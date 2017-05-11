export declare class LockType {
    value: string;
    constructor(value: string);
    toString(): string;
    static Write: LockType;
}
export declare class LockScope {
    value: string;
    constructor(value: string);
    toString(): string;
    static Shared: LockScope;
    static Exclusive: LockScope;
}
export declare class LockKind {
    scope: LockScope;
    type: LockType;
    timeout: number;
    constructor(scope: LockScope, type: LockType, timeout?: number);
    isSimilar(lockKind: LockKind): boolean;
}
export declare class Lock {
    lockKind: LockKind;
    expirationDate: number;
    owner: string;
    uuid: string;
    constructor(lockKind: LockKind, owner: string);
    static generateUUID(expirationDate: number): string;
    expired(): boolean;
}
export declare class LockBag {
    locks: Array<Lock>;
    private notExpired(l);
    private cleanLocks();
    getLocks(lockKind: LockKind): Array<Lock>;
    setLock(lock: Lock): boolean;
    removeLock(uuid: string, owner: string): void;
    canRemoveLock(uuid: string, owner: string): boolean;
    canLock(lockKind: LockKind): boolean;
}
