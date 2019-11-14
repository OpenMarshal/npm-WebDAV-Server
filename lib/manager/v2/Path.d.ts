export declare class Path {
    paths: string[];
    static isPath(obj: any): boolean;
    constructor(path: Path | string[] | string);
    decode(): void;
    isRoot(): boolean;
    fileName(): string;
    rootName(): string;
    parentName(): string;
    getParent(): Path;
    hasParent(): boolean;
    removeRoot(): string;
    removeFile(): string;
    getChildPath(childPath: string | Path): Path;
    clone(): Path;
    toString(endsWithSlash?: boolean): string;
}
