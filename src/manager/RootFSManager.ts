import { IResource, ResourceType } from '../resource/IResource'
import { VirtualFSManager } from './VirtualFSManager'
import { SerializedObject } from './ISerializer'
import { VirtualFolder } from '../resource/virtual/VirtualFolder'
import { RootResource } from '../resource/std/RootResource'
import { VirtualFile } from '../resource/virtual/VirtualFile'
import { FSManager } from './FSManager'
import { Errors } from '../Errors'

const virtualFSManager = new VirtualFSManager();

export class RootFSManager implements FSManager
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

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        if(type.isDirectory)
            return new VirtualFolder(name, parent, virtualFSManager);
        if(type.isFile)
            return new VirtualFile(name, parent, virtualFSManager);

        throw Errors.UnrecognizedResource;
    }
}
