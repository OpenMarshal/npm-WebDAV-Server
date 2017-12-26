/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource';
import { Readable, Writable } from 'stream';
import { FSManager } from '../../../manager/v1/FSManager';
import { StandardResource } from '../std/StandardResource';
export declare abstract class VirtualResource extends StandardResource {
    name: string;
    constructor(name: string, parent?: IResource, fsManager?: FSManager);
    create(callback: SimpleCallback): void;
    delete(callback: SimpleCallback): void;
    rename(newName: string, callback: Return2Callback<string, string>): void;
    webName(callback: ReturnCallback<string>): void;
    abstract type(callback: ReturnCallback<ResourceType>): any;
    abstract write(targetSource: boolean, callback: ReturnCallback<Writable>): any;
    abstract read(targetSource: boolean, callback: ReturnCallback<Readable>): any;
    abstract mimeType(targetSource: boolean, callback: ReturnCallback<string>): any;
    abstract size(targetSource: boolean, callback: ReturnCallback<number>): any;
    abstract addChild(resource: IResource, callback: SimpleCallback): any;
    abstract removeChild(resource: IResource, callback: SimpleCallback): any;
    abstract getChildren(callback: ReturnCallback<IResource[]>): any;
}
