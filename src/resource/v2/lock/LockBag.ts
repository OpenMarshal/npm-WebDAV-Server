import { LockScope } from './LockScope'
import { LockKind } from './LockKind'
import { LockType } from './LockType'
import { Lock } from './Lock'

export class LockBag
{
    protected locks : Lock[]

    constructor()
    {
        this.locks = [];
    }

    getLocks(lockType ?: LockType) : Lock[]
    {
        this.cleanLocks();

        let locks = this.locks;

        if(lockType)
            locks = locks.filter((lock) => lock.lockKind.type.isSame(lockType));

        return locks;
    }

    getLock(uuid : string) : Lock
    {
        for(const lock of this.locks)
        {
            if(lock.uuid === uuid)
                return lock;
        }
        
        return null;
    }

    setLock(lock : Lock) : boolean
    {
        const canLock = this.canLock(lock.lockKind);

        if(canLock)
            this.locks.push(lock);

        return canLock;
    }

    removeLock(uuid : string) : void
    {
        this.locks = this.locks.filter((lock) => this.notExpired(lock) && lock.uuid !== uuid);
    }

    canLock(lockKind : LockKind) : boolean
    {
        this.cleanLocks();

        return !(lockKind.scope.isSame(LockScope.Exclusive) && this.locks.length > 0)
            && !this.locks.some((l) => l.lockKind.scope.isSame(LockScope.Exclusive));
    }

    protected notExpired(lock : Lock)
    {
        return !lock.expired();
    }

    protected cleanLocks()
    {
        this.locks = this.locks.filter(this.notExpired);
    }
}
