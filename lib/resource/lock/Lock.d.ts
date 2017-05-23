import { XMLElement } from '../../helper/XML';
import { LockKind } from './LockKind';
import { IUser } from '../../user/IUser';
export declare type LockOwner = string | XMLElement | XMLElement[];
export declare class Lock {
    static generateUUID(expirationDate: number): string;
    lockKind: LockKind;
    expirationDate: number;
    owner: LockOwner;
    uuid: string;
    user: IUser;
    constructor(lockKind: LockKind, user: IUser, owner: LockOwner);
    expired(): boolean;
    refresh(timeout?: number): void;
}
