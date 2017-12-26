/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource';
import { Readable, Writable } from 'stream';
import { VirtualResource } from './VirtualResource';
import { FSManager } from '../../../manager/v1/FSManager';
export declare class VirtualFileReadable extends Readable {
    contents: Int8Array[];
    blockIndex: number;
    constructor(contents: Int8Array[]);
    _read(size: number): void;
}
export declare class VirtualFileWritable extends Writable {
    contents: Int8Array[];
    constructor(contents: Int8Array[]);
    _write(chunk: Buffer | string | any, encoding: string, callback: (error: Error) => void): void;
}
export declare class VirtualFile extends VirtualResource {
    content: Int8Array[];
    len: number;
    constructor(name: string, parent?: IResource, fsManager?: FSManager);
    type(callback: ReturnCallback<ResourceType>): void;
    write(targetSource: boolean, callback: ReturnCallback<Writable>): void;
    read(targetSource: boolean, callback: ReturnCallback<Readable>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
}
