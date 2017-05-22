import { IResource, ResourceType } from '../resource/IResource'
import { SerializedObject } from './ISerializer'
import { VirtualResource } from '../resource/virtual/VirtualResource'
import { VirtualFolder } from '../resource/virtual/VirtualFolder'
import { VirtualFile } from '../resource/virtual/VirtualFile'
import { FSManager } from './FSManager'
import { Errors } from '../Errors'

export class VirtualFSManager implements FSManager
{
    uid : string = 'VirtualFSManager_1.0.2';

    serialize(resource : any, obj : SerializedObject) : object
    {
        const result : {
            name,
            content
        } = {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        } as any;

        result.name = resource.name;
        if(resource.content)
            result.content = resource.content;

        return result;
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        if(obj.type.isDirectory)
        {
            const rs = new VirtualFolder(data.name, null, this);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }

        if(obj.type.isFile)
        {
            const rs = new VirtualFile(data.name, null, this);
            if(data.content)
                rs.content = new Buffer(data.content);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }

        throw Errors.UnrecognizedResource;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        if(type.isDirectory)
            return new VirtualFolder(name, parent, this);
        if(type.isFile)
            return new VirtualFile(name, parent, this);

        throw Errors.UnrecognizedResource;
    }
}
