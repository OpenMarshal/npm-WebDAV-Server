/// <reference types="node" />
import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource';
import { Readable, Writable } from 'stream';
import { StandardResource } from '../std/StandardResource';
import { FSManager } from '../../../manager/v1/FSManager';
export declare abstract class PhysicalResource extends StandardResource {
    removeOnUnavailableSource: boolean;
    realPath: string;
    name: string;
    constructor(realPath: string, parent?: IResource, fsManager?: FSManager);
    protected manageError(error: Error): Error;
    protected wrapCallback<T extends Function>(callback: T): T;
    abstract create(callback: SimpleCallback): any;
    abstract delete(callback: SimpleCallback): any;
    moveTo(parent: IResource, newName: string, overwrite: boolean, callback: SimpleCallback): void;
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
