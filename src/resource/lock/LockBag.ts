import { LockScope } from './LockScope'
import { LockKind } from './LockKind'
import { Lock } from './Lock'

export class LockBag
{
    locks : Lock[]

    constructor()
    {
        this.locks = [];
    }

    getLocks(lockKind : LockKind) : Lock[]
    {
        this.cleanLocks();
        return this.locks.filter((l) => l.lockKind.isSimilar(lockKind))
    }

    setLock(lock : Lock) : boolean
    {
        if(!this.canLock(lock.lockKind))
            return false;
        
        this.locks.push(lock);
        return true;
    }

    removeLock(uuid : string, owner : string) : void
    {
        this.locks = this.locks.filter((l) => this.notExpired(l) && (l.uuid !== uuid || l.owner !== owner));
    }
    canRemoveLock(uuid : string, owner : string) : boolean
    {
        this.cleanLocks();
        return this.locks.some((l) => l.uuid === uuid && l.owner !== owner);
    }

    canLock(lockKind : LockKind) : boolean
    {
        this.cleanLocks();
        return !this.locks.some((l) => {
            return l.lockKind.scope === LockScope.Exclusive;
        });
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
