import { SerializedObject, FSManager, Errors, IResource, ResourceType } from 'webdav-server'
import { FTPFile, FTPFolder, FTPResource, } from './Resource'
import { FTPGateway } from './FTPGateway'
import * as FTPClient from 'ftp'

export class FTPFSManager implements FSManager
{
    uid : string;

    connect(callback : (client : FTPClient) => void)
    {
        const client = new FTPClient();
        client.on('ready', () => callback(client));
        client.connect(this.config);
    }

    constructor(public config : FTPClient.Options)
    {
        this.uid = 'FTPFSManager_1.0.0' + config.host;
    }
    
    serialize(resource : any, obj : SerializedObject) : object
    {
        if(resource.constructor !== FTPGateway)
            return null;

        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            name: resource.name,
            rootPath: resource.rootPath
        };
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        const rs = new FTPGateway(this.config, data.rootPath, data.name, null, this);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        const parentRemotePath = parent.constructor === FTPGateway ? (parent as FTPGateway).rootPath : (parent as FTPResource).remotePath;
        let remotepath;
        if(parentRemotePath.lastIndexOf('/') === parentRemotePath.length - 1)
            remotepath = parentRemotePath + name;
        else
            remotepath = parentRemotePath + '/' + name;
        
        let gateway = parent;
        while(gateway && gateway.constructor !== FTPGateway)
            gateway = gateway.parent;

        if(type.isFile)
            return new FTPFile(gateway as FTPGateway, null, remotepath, parent, this);
        else if(type.isDirectory)
            return new FTPFolder(gateway as FTPGateway, null, remotepath, parent, this);

        throw Errors.InvalidOperation;
    }
}
