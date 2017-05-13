import { LockKind } from './LockKind';
export declare class Lock {
    static generateUUID(expirationDate: number): string;
    lockKind: LockKind;
    expirationDate: number;
    owner: string;
    uuid: string;
    constructor(lockKind: LockKind, owner: string);
    expired(): boolean;
}
