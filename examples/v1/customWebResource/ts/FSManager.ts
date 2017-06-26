import { SerializedObject, FSManager, Errors, IResource, ResourceType } from 'webdav-server'
import { WebFile } from './Resource'

export class WebFSManager implements FSManager
{
    uid : string = 'WebFSManager_1.0.0';
    
    serialize(resource : any, obj : SerializedObject) : object
    {
        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            webUrl: resource.webUrl,
            fileName: resource.fileName,
            refreshTimeoutMS: resource.refreshTimeoutMS
        };
    }

    unserialize(data : any, obj : SerializedObject) : IResource
    {
        const rs = new WebFile(data.webUrl, data.fileName, data.refreshTimeoutMS);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        throw Errors.InvalidOperation;
    }
}
