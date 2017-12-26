import { XMLElement } from 'xml-js-builder';
import { LockKind } from './LockKind';
import { IUser } from '../../../user/v1/IUser';
export declare type LockOwner = string | XMLElement | XMLElement[];
export declare class Lock {
    static generateUUID(expirationDate: number): string;
    lockKind: LockKind;
    expirationDate: number;
    owner: LockOwner;
    depth: number;
    uuid: string;
    userUid: string;
    constructor(lockKind: LockKind, user: IUser | string, owner: LockOwner, depth?: number);
    isSame(lock: Lock): boolean;
    expired(): boolean;
    refresh(timeout?: number): void;
}
