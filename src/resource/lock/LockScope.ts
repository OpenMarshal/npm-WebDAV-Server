
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
}
