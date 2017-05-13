import { IResource, ResourceType } from '../resource/Resource'

export { PhysicalFSManager } from './PhysicalFSManager'
export { VirtualFSManager } from './VirtualFSManager'
export { FSPath } from './FSPath'

export interface FSManager
{
    serialize(resource : IResource) : object;
    unserialize(serializedResource : object) : IResource;

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource;
}
