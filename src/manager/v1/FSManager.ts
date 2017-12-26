import { ISerializer, SerializedObject } from './ISerializer'
import { IResource, ResourceType } from '../../resource/v1/IResource'

export { FSPath } from './FSPath'

export interface FSManager extends ISerializer
{
    uid : string

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource;
}
