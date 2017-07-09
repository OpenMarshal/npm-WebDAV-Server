import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { XMLElement } from '../../../helper/XML'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import { ReturnCallback, SimpleCallback } from './CommonTypes'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export interface ILockManager
{
    getLocks(callback : ReturnCallback<Lock[]>) : void
    setLock(lock : Lock, callback : SimpleCallback) : void
    removeLock(uuid : string, callback : ReturnCallback<boolean>) : void
    getLock(uuid : string, callback : ReturnCallback<Lock>) : void
    refresh(uuid : string, timeout : number, callback : ReturnCallback<Lock>) : void
}
export class LocalLockManager implements ILockManager
{
    locks : Lock[] = [];
    
    constructor(serializedData ?: any)
    {
        if(serializedData)
            for(const name in serializedData)
                this[name] = serializedData[name];
    }

    getLocks(callback : ReturnCallback<Lock[]>) : void
    {
        this.locks = this.locks.filter((lock) => !lock.expired());
        
        callback(null, this.locks);
    }

    setLock(lock : Lock, callback : SimpleCallback) : void
    {
        this.locks.push(lock);
        callback(null);
    }

    removeLock(uuid : string, callback : ReturnCallback<boolean>) : void
    {
        for(let index = 0; index < this.locks.length; ++index)
            if(this.locks[index].uuid === uuid)
            {
                this.locks.splice(index, 1);
                return callback(null, true);
            }
        
        callback(null, false);
    }

    getLock(uuid : string, callback : ReturnCallback<Lock>) : void
    {
        this.locks = this.locks.filter((lock) => !lock.expired());
        
        for(const lock of this.locks)
            if(lock.uuid === uuid)
                return callback(null, lock);
        
        callback();
    }

    refresh(uuid : string, timeout : number, callback : ReturnCallback<Lock>) : void
    {
        this.getLock(uuid, (e, lock) => {
            if(e || !lock)
                return callback(e);
            
            lock.refresh(timeout);
            callback(null, lock);
        })
    }
}
