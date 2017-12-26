import { PhysicalFSManager } from './PhysicalFSManager';
import { SerializedObject } from './ISerializer';
import { IResource } from '../../resource/v1/IResource';
export declare class PhysicalGFSManager extends PhysicalFSManager {
    uid: string;
    serialize(resource: any, obj: SerializedObject): object;
    unserialize(data: any, obj: SerializedObject): IResource;
}
