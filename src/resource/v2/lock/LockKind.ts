import { LockScope } from './LockScope'
import { LockType } from './LockType'

export class LockKind
{
    constructor(
        public scope : LockScope,
        public type : LockType,
        public timeout : number = 60)
    { }

    isSimilar(lockKind : LockKind)
    {
        return this.scope.isSame(lockKind.scope) && this.type.isSame(lockKind.type);
    }
}
