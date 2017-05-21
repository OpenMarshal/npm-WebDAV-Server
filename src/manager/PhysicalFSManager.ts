import { SerializedObject } from './ISerializer'
import { IResource, ResourceType } from '../resource/IResource'
import { PhysicalResource } from '../resource/physical/PhysicalResource'
import { PhysicalFolder } from '../resource/physical/PhysicalFolder'
import { PhysicalFile } from '../resource/physical/PhysicalFile'
import { FSManager } from './FSManager'
import * as path from 'path'

export class PhysicalFSManager implements FSManager
{
    uid : string = 'PhysicalFSManager_1.0.2';

    serialize(resource : any, obj : SerializedObject) : object
    {
        if(!resource.realPath)
            throw new Error('Unrecognized resource');

        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
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
        rs.lockBag.locks = data.locks;
        rs.properties = data.properties;

        return rs;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        const parentRealPath = (parent as any).realPath;

        if(!parentRealPath)
            throw new Error('Can\'t create a physical resource with a non-physical parent')
        
        const newRealPath = path.join(parentRealPath, name);
        
        if(type.isDirectory)
            return new PhysicalFolder(newRealPath, parent, this);
        else
            return new PhysicalFile(newRealPath, parent, this);
    }
}
