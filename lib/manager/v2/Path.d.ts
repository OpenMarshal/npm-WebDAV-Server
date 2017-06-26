export declare class Path {
    paths: string[];
    constructor(path: Path | string[] | string);
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
