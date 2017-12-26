import { XMLElement } from 'xml-js-builder'
import { LockKind } from './LockKind'
import { IUser } from '../../../user/v1/IUser'

export type LockOwner = string | XMLElement | XMLElement[];

export class Lock
{
    static generateUUID(expirationDate : number) : string
    {
        const rnd1 = Math.ceil(Math.random() * 0x3FFF) + 0x8000;
        const rnd2 = Math.ceil(Math.random() * 0xFFFFFFFF);

        function pad(value : number, nb : number)
        {
            if(value < 0)
                value *= -1;
            
            let str = Math.ceil(value).toString(16);
            while(str.length < nb)
                str = '0' + str;
            return str;
        }

        let uuid = 'urn:uuid:';
        // time_low
        uuid += pad(expirationDate & 0xFFFFFFFF, 8);
        // time_mid
        uuid += '-' + pad((expirationDate >> 32) & 0xFFFF, 4);
        // time_hi_and_version
        uuid += '-' + pad(((expirationDate >> (32 + 16)) & 0x0FFF) + 0x1000, 4);
        // clock_seq_hi_and_reserved
        uuid += '-' + pad((rnd1 >> 16) & 0xFF, 2);
        // clock_seq_low
        uuid += pad(rnd1 & 0xFF, 2);
        // node
        uuid += '-' + pad(rnd2, 12);

        return uuid;
    }

    lockKind : LockKind
    expirationDate : number
    owner : LockOwner
    depth : number
    uuid : string
    userUid : string

    constructor(lockKind : LockKind, user : IUser | string, owner : LockOwner, depth ?: number)
    {
        this.expirationDate = Date.now() + lockKind.timeout * 1000;
        this.lockKind = lockKind;
        this.owner = owner;
        this.depth = depth === undefined || depth === null ? -1 : depth;
        this.uuid = Lock.generateUUID(this.expirationDate);
        this.userUid = user ? user.constructor === String ? user as string : (user as IUser).uid : null;
    }

    isSame(lock : Lock) : boolean
    {
        return this.uuid === lock.uuid && this.userUid === lock.userUid && this.expirationDate === lock.expirationDate && this.lockKind.isSimilar(lock.lockKind);
    }

    expired() : boolean
    {
        return Date.now() > this.expirationDate;
    }

    refresh(timeout ?: number)
    {
        this.expirationDate += timeout ? timeout : this.lockKind.timeout;
    }
}
