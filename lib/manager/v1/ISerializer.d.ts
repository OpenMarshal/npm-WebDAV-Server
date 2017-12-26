import { IResource, ResourceType } from '../../resource/v1/IResource';
import { FSManager } from './FSManager';
export declare class SerializedObject {
    data: any;
    type: ResourceType;
    children: SerializedObject[];
    managerUID: string;
    constructor(managerUID: string, type: ResourceType);
}
export interface ISerializer {
    serialize(resource: IResource, obj: SerializedObject): object;
    unserialize(data: any, obj: SerializedObject): IResource;
}
export declare function unserialize(obj: SerializedObject, managers: FSManager[], callback: (error: Error, rootResource: IResource) => void): void;
export declare function serialize(resource: IResource, callback: (error: Error, obj: SerializedObject) => void): void;
