import { ISerializer } from './ISerializer';
import { IResource, ResourceType } from '../resource/IResource';
export { PhysicalFSManager } from './PhysicalFSManager';
export { VirtualFSManager } from './VirtualFSManager';
export { FSPath } from './FSPath';
export interface FSManager extends ISerializer {
    uid: string;
    newResource(fullPath: string, name: string, type: ResourceType, parent: IResource): IResource;
}
