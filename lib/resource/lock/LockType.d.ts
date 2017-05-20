export declare class LockType {
    value: string;
    static Write: LockType;
    constructor(value: string);
    toString(): string;
    isSame(scope: LockType): boolean;
}
