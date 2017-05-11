import { IResource, SimpleCallback } from './Resource';
export declare class ResourceChildren {
    children: Array<IResource>;
    constructor();
    add(resource: IResource, callback: SimpleCallback): void;
    remove(resource: IResource, callback: SimpleCallback): void;
}
export declare function forAll<T>(array: Array<T>, itemFn: (item: T, callback: (e) => void) => void, onAllAndSuccess: () => void, onError: (e) => void): void;
