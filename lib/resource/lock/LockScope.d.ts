export declare class LockScope {
    value: string;
    static Shared: LockScope;
    static Exclusive: LockScope;
    constructor(value: string);
    toString(): string;
    isSame(scope: LockScope): boolean;
}
