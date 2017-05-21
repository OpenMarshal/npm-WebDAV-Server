import { IResource } from '../resource/IResource';
import { VirtualFSManager } from './VirtualFSManager';
import { SerializedObject } from './ISerializer';
export declare class RootFSManager extends VirtualFSManager {
    uid: string;
    serialize(resource: any, obj: SerializedObject): object;
    unserialize(data: any, obj: SerializedObject): IResource;
}
