import { VirtualResource } from '../resource/VirtualResource';
import { IResource, ResourceType } from '../resource/Resource';
import { FSManager } from './FSManager';
export declare class VirtualFSManager implements FSManager {
    private static _instance;
    static instance(): VirtualFSManager;
    serialize(resource: any): object;
    unserialize(serializedResource: {
        name;
        children;
        content;
    }): VirtualResource;
    newResource(fullPath: string, name: string, type: ResourceType, parent: IResource): IResource;
}
