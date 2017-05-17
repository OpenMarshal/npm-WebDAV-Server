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
    getChildPath(childName: string): FSPath;
    clone(): FSPath;
    toString(): string;
}
