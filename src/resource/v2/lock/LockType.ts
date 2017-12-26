
export class LockType
{
    static Write = new LockType('write')

    constructor(public value : string)
    { }

    toString()
    {
        return this.value;
    }

    isSame(scope : LockType) : boolean
    {
        return scope.value.toLowerCase() === this.value.toLowerCase();
    }
}
