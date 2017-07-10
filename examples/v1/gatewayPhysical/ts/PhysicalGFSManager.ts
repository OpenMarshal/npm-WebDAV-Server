import { SerializedObject, FSManager, Errors, IResource, ResourceType, PhysicalFSManager, PhysicalFile, PhysicalFolder, PhysicalResource } from 'webdav-server'
import { PhysicalGateway } from './PhysicalGateway'

export class PhysicalGFSManager extends PhysicalFSManager
{
    uid : string = 'PhysicalGFSManager_1.0.0';
    
    serialize(resource : any, obj : SerializedObject) : object
    {
        if(resource.constructor !== PhysicalGateway)
            return null;

        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            customName: resource.customName
        };
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        const rs = new PhysicalGateway(data.realPath, data.customName, null, this);
        
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;

        return rs;
    }
}
