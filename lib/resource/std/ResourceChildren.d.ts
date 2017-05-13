import { IResource, SimpleCallback } from '../IResource';
export declare class ResourceChildren {
    children: IResource[];
    constructor();
    add(resource: IResource, callback: SimpleCallback): void;
    remove(resource: IResource, callback: SimpleCallback): void;
}
export declare function forAll<T>(array: T[], itemFn: (item: T, callback: (e) => void) => void, onAllAndSuccess: () => void, onError: (e) => void): void;
