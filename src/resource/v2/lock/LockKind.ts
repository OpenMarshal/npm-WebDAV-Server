import { LockScope } from './LockScope'
import { LockType } from './LockType'

export class LockKind
{
    public scope : LockScope
    public type : LockType

    /**
     * Timeout in seconds
     */
    public timeout : number

    constructor(scope : LockScope, type : LockType, timeoutSeconds : number = 60)
    {
        this.timeout = timeoutSeconds;
        this.scope = scope;
        this.type = type;
    }

    isSimilar(lockKind : LockKind)
    {
        return this.scope.isSame(lockKind.scope) && this.type.isSame(lockKind.type);
    }
}
