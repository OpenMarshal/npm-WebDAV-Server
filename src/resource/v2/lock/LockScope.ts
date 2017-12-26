
export class LockScope
{
    static Shared = new LockScope('shared')
    static Exclusive = new LockScope('exclusive')

    constructor(public value : string)
    { }

    toString()
    {
        return this.value;
    }

    isSame(scope : LockScope) : boolean
    {
        return scope.value.toLowerCase() === this.value.toLowerCase();
    }
}
