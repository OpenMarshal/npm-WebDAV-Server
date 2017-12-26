import { LockScope } from './LockScope'
import { LockKind } from './LockKind'
import { LockType } from './LockType'
import { Lock } from './Lock'

export class LockBag
{
    locks : Lock[]

    constructor()
    {
        this.locks = [];
    }

    getLocks(lockType ?: LockType) : Lock[]
    {
        this.cleanLocks();
        if(lockType)
            return this.locks.filter((l) => l.lockKind.type.isSame(lockType));
        else
            return this.locks;
    }
    getLock(uuid : string) : Lock
    {
        for(const lock of this.locks)
            if(lock.uuid === uuid)
                return lock;
        
        return null;
    }

    setLock(lock : Lock) : boolean
    {
        if(!this.canLock(lock.lockKind))
            return false;
        
        this.locks.push(lock);
        return true;
    }

    removeLock(uuid : string) : void
    {
        this.locks = this.locks.filter((l) => this.notExpired(l) && l.uuid !== uuid);
    }

    canLock(lockKind : LockKind) : boolean
    {
        this.cleanLocks();
        return !(lockKind.scope.isSame(LockScope.Exclusive) && this.locks.length > 0) && !this.locks.some((l) => l.lockKind.scope.isSame(LockScope.Exclusive));
    }

    private notExpired(l : Lock)
    {
        return !l.expired();
    }
    private cleanLocks()
    {
        this.locks = this.locks.filter(this.notExpired);
    }
}
