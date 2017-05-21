import { IResource, SimpleCallback } from '../IResource';
export declare class ResourceChildren {
    children: IResource[];
    constructor();
    add(resource: IResource, callback: SimpleCallback): void;
    remove(resource: IResource, callback: SimpleCallback): void;
}
