export declare class LockType {
    value: string;
    static Write: LockType;
    constructor(value: string);
    toString(): string;
}
export declare class LockScope {
    value: string;
    static Shared: LockScope;
    static Exclusive: LockScope;
    constructor(value: string);
    toString(): string;
}
export declare class LockKind {
    scope: LockScope;
    type: LockType;
    timeout: number;
    constructor(scope: LockScope, type: LockType, timeout?: number);
    isSimilar(lockKind: LockKind): boolean;
}
export declare class Lock {
    static generateUUID(expirationDate: number): string;
    lockKind: LockKind;
    expirationDate: number;
    owner: string;
    uuid: string;
    constructor(lockKind: LockKind, owner: string);
    expired(): boolean;
}
export declare class LockBag {
    locks: Lock[];
    getLocks(lockKind: LockKind): Lock[];
    setLock(lock: Lock): boolean;
    removeLock(uuid: string, owner: string): void;
    canRemoveLock(uuid: string, owner: string): boolean;
    canLock(lockKind: LockKind): boolean;
    private notExpired(l);
    private cleanLocks();
}
