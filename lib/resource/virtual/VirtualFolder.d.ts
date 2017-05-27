/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource';
import { Readable } from 'stream';
import { ResourceChildren } from '../std/ResourceChildren';
import { VirtualResource } from './VirtualResource';
import { FSManager } from '../../manager/FSManager';
export declare class VirtualFolder extends VirtualResource {
    children: ResourceChildren;
    constructor(name: string, parent?: IResource, fsManager?: FSManager);
    type(callback: ReturnCallback<ResourceType>): void;
    append(data: Int8Array, targetSource: boolean, callback: SimpleCallback): void;
    write(data: Int8Array, targetSource: boolean, callback: SimpleCallback): void;
    read(targetSource: boolean, callback: ReturnCallback<Int8Array | Readable>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
}
