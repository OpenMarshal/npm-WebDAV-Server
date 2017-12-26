import { SerializedObject } from './ISerializer'
import { IResource, ResourceType } from '../../resource/v1/IResource'
import { PhysicalResource } from '../../resource/v1/physical/PhysicalResource'
import { PhysicalFolder } from '../../resource/v1/physical/PhysicalFolder'
import { PhysicalFile } from '../../resource/v1/physical/PhysicalFile'
import { FSManager } from './FSManager'
import { Errors } from '../../Errors'
import * as path from 'path'

export class PhysicalFSManager implements FSManager
{
    uid : string = 'PhysicalFSManager_1.0.2';

    serialize(resource : any, obj : SerializedObject) : object
    {
        if(!resource.realPath)
            throw Errors.UnrecognizedResource;

        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties
        };
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        let rs : PhysicalResource;
        if(obj.type.isFile)
            rs = new PhysicalFile(data.realPath, null, this);
        else
            rs = new PhysicalFolder(data.realPath, null, this);
        
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;

        return rs;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        const parentRealPath = (parent as any).realPath;

        if(!parentRealPath)
            throw Errors.ParentPropertiesMissing;
        
        const newRealPath = path.join(parentRealPath, name);
        
        if(type.isDirectory)
            return new PhysicalFolder(newRealPath, parent, this);
        else
            return new PhysicalFile(newRealPath, parent, this);
    }
}
