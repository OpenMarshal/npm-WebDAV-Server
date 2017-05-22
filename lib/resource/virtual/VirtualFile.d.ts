import { IResource, SimpleCallback, ReturnCallback, ResourceType } from '../IResource';
import { VirtualResource } from './VirtualResource';
import { FSManager } from '../../manager/FSManager';
export declare class VirtualFile extends VirtualResource {
    content: Int8Array;
    constructor(name: string, parent?: IResource, fsManager?: FSManager);
    type(callback: ReturnCallback<ResourceType>): void;
    append(data: Int8Array, targetSource: boolean, callback: SimpleCallback): void;
    write(data: Int8Array, targetSource: boolean, callback: SimpleCallback): void;
    read(targetSource: boolean, callback: ReturnCallback<Int8Array>): void;
    mimeType(targetSource: boolean, callback: ReturnCallback<string>): void;
    size(targetSource: boolean, callback: ReturnCallback<number>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
}
