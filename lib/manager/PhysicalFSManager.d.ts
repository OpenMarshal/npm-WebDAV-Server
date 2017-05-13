import { IResource, ResourceType } from '../resource/IResource';
import { PhysicalResource } from '../resource/physical/PhysicalResource';
import { FSManager } from './FSManager';
export declare class PhysicalFSManager implements FSManager {
    private static _instance;
    static instance(): PhysicalFSManager;
    serialize(resource: any): object;
    unserialize(serializedResource: {
        realPath: string;
        isFile: boolean;
    }): PhysicalResource;
    newResource(fullPath: string, name: string, type: ResourceType, parent: IResource): IResource;
}
