export declare class FSPath {
    paths: string[];
    constructor(path: FSPath | string[] | string);
    isRoot(): boolean;
    fileName(): string;
    rootName(): string;
    parentName(): string;
    getParent(): FSPath;
    hasParent(): boolean;
    removeRoot(): void;
    clone(): FSPath;
    toString(): string;
}
