import { IResource, ResourceType } from '../resource/IResource';
import { SerializedObject } from './ISerializer';
import { FSManager } from './FSManager';
export declare class RootFSManager implements FSManager {
    uid: string;
    serialize(resource: any, obj: SerializedObject): object;
    unserialize(data: any, obj: SerializedObject): IResource;
    newResource(fullPath: string, name: string, type: ResourceType, parent: IResource): IResource;
}
