import { IResource, ReturnCallback } from '../IResource';
import { FSManager, FSPath } from '../../../manager/v1/FSManager';
import { PhysicalResource } from './PhysicalResource';
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { PhysicalFolder } from './PhysicalFolder';
export declare class PhysicalGateway extends PhysicalFolder {
    protected customName?: string;
    cache: {
        [path: string]: PhysicalResource;
    };
    constructor(rootPath: string, customName?: string, parent?: IResource, fsManager?: FSManager);
    webName(callback: ReturnCallback<string>): void;
    protected listChildren(parent: PhysicalResource, rpath: string, callback: (error: Error, children?: IResource[]) => void): void;
    protected find(path: FSPath, callback: (error: Error, resource?: PhysicalResource) => void, forceRefresh?: boolean): void;
    gateway(arg: MethodCallArgs, path: FSPath, callback: (error: Error, resource?: IResource) => void): void;
}
