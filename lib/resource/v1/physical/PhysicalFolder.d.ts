/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource';
import { Readable, Writable } from 'stream';
import { ResourceChildren } from '../std/ResourceChildren';
import { PhysicalResource } from './PhysicalResource';
import { FSManager } from '../../../manager/v1/FSManager';
export declare class PhysicalFolder extends PhysicalResource {
    children: ResourceChildren;
    constructor(realPath: string, parent?: IResource, fsManager?: FSManager);
    type(callback: ReturnCallback<ResourceType>): void;
    create(callback: SimpleCallback): void;
    delete(callback: SimpleCallback): void;
    write(targetSource: boolean, callback: ReturnCallback<Writable>): void;
    read(targetSource: boolean, callback: ReturnCallback<Readable>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
    static loadFromPath(path: string, callback: ReturnCallback<PhysicalFolder>): void;
}
