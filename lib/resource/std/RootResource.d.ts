import { IResource, SimpleCallback, ReturnCallback, Return2Callback, ResourceType } from '../IResource';
import { StandardResource } from './StandardResource';
import { ResourceChildren } from './ResourceChildren';
export declare class RootResource extends StandardResource {
    children: ResourceChildren;
    constructor();
    create(callback: SimpleCallback): void;
    delete(callback: SimpleCallback): void;
    moveTo(parent: IResource, newName: string, override: boolean, callback: SimpleCallback): void;
    rename(newName: string, callback: Return2Callback<string, string>): void;
    webName(callback: ReturnCallback<string>): void;
    type(callback: ReturnCallback<ResourceType>): void;
    append(data: Int8Array, callback: SimpleCallback): void;
    write(data: Int8Array, callback: SimpleCallback): void;
    read(callback: ReturnCallback<Int8Array>): void;
    mimeType(callback: ReturnCallback<string>): void;
    size(callback: ReturnCallback<number>): void;
    addChild(resource: IResource, callback: SimpleCallback): void;
    removeChild(resource: IResource, callback: SimpleCallback): void;
    getChildren(callback: ReturnCallback<IResource[]>): void;
}
