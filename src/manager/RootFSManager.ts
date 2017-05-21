import { IResource, ResourceType } from '../resource/IResource'
import { VirtualFSManager } from './VirtualFSManager'
import { SerializedObject } from './ISerializer'
import { RootResource } from '../resource/std/RootResource'
import { FSManager } from './FSManager'

export class RootFSManager extends VirtualFSManager
{
    uid : string = 'RootFSManager_1.0.2';
    
    serialize(resource : any, obj : SerializedObject) : object
    {
        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        };
    }

    unserialize(data : any, obj : SerializedObject) : IResource
    {
        const rs = new RootResource();
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.lockBag.locks = data.locks;
        rs.properties = data.properties;
        return rs;
    }
}
