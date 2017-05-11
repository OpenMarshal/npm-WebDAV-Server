
export class LockType
{
    constructor(public value:string)
    { }

    toString()
    {
        return this.value;
    }

    static Write = new LockType('write')
}

export class LockScope
{
    constructor(public value:string)
    { }

    toString()
    {
        return this.value;
    }

    static Shared = new LockScope('shared')
    static Exclusive = new LockScope('exclusive')
}

export class LockKind
{
    constructor(
        public scope : LockScope,
        public type : LockType,
        public timeout : number = 60)
    { }

    isSimilar(lockKind : LockKind)
    {
        return this.scope === lockKind.scope && this.type === lockKind.type;
    }
}

export class Lock
{
    lockKind : LockKind
    expirationDate : number
    owner : string
    uuid : string

    constructor(lockKind : LockKind, owner : string)
    {
        this.expirationDate = Date.now() + lockKind.timeout;
        this.lockKind = lockKind;
        this.owner = owner;
        this.uuid = Lock.generateUUID(this.expirationDate);
    }

    static generateUUID(expirationDate : number) : string
    {
        var rnd1 = Math.ceil(Math.random() * 0x3FFF) + 0x8000;
        var rnd2 = Math.ceil(Math.random() * 0xFFFFFFFF);

        function pad(value : number, nb : number)
        {
            var str = Math.ceil(value).toString(16);
            while(str.length < nb)
                str = '0' + str;
            return str;
        }

        var uuid = 'urn:uuid:';
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

    expired() : boolean
    {
        return Date.now() > this.expirationDate;
    }
}

export class LockBag
{
    locks : Array<Lock>

    private notExpired(l : Lock)
    {
        return !l.expired();
    }
    private cleanLocks()
    {
        this.locks = this.locks.filter(this.notExpired);
    }

    getLocks(lockKind : LockKind) : Array<Lock>
    {
        this.cleanLocks();
        return this.locks.filter(l => l.lockKind.isSimilar(lockKind))
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
        this.locks = this.locks.filter(l => this.notExpired(l) && (l.uuid !== uuid || l.owner !== owner));
    }
    canRemoveLock(uuid : string, owner : string) : boolean
    {
        this.cleanLocks();
        return this.locks.some(l => l.uuid === uuid && l.owner !== owner);
    }

    canLock(lockKind : LockKind) : boolean
    {
        this.cleanLocks();
        return !this.locks.some(l => {
            return l.lockKind.scope === LockScope.Exclusive;
        });
    }
}

