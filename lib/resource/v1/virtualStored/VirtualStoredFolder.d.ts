/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource';
import { Readable, Writable } from 'stream';
import { ResourceChildren } from '../std/ResourceChildren';
import { VirtualStoredResource } from './VirtualStoredResource';
import { FSManager } from '../../../manager/v1/FSManager';
export declare class VirtualStoredFolder extends VirtualStoredResource {
    children: ResourceChildren;
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
