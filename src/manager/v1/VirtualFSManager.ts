import { IResource, ResourceType } from '../../resource/v1/IResource'
import { SerializedObject } from './ISerializer'
import { VirtualFolder } from '../../resource/v1/virtual/VirtualFolder'
import { VirtualFile } from '../../resource/v1/virtual/VirtualFile'
import { FSManager } from './FSManager'
import { Errors } from '../../Errors'

export class VirtualFSManager implements FSManager
{
    uid : string = 'VirtualFSManager_1.0.2';

    serialize(resource : any, obj : SerializedObject) : object
    {
        const result : any = {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties
        };

        result.name = resource.name;
        if(resource.content)
        {
            result.content = resource.content;
            result.len = resource.len;
        }

        return result;
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        if(obj.type.isDirectory)
        {
            const rs = new VirtualFolder(data.name, null, this);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.properties = data.properties;
            return rs;
        }

        if(obj.type.isFile)
        {
            const rs = new VirtualFile(data.name, null, this);
            if(data.content)
            {
                rs.content = data.content.map((a) => Buffer.from(a));
                rs.len = data.len;
            }
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
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
