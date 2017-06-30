"use strict";
const webdav = require('webdav-server'),
      FTPClient = require('ftp'),
      ftpResource = require('./Resource'),
      ftpGateway = require('./ftpGateway.js');

module.exports.FTPFSManager = function(config)
{
    const fsManager = {
        config,
        uid: 'FTPFSManager_1.0.0' + config.host
    };
    fsManager.constructor = module.exports.FTPFSManager;

    fsManager.connect = function(callback)
    {
        const client = new FTPClient();
        client.on('ready', () => callback(client));
        client.connect(this.config);
    }
    
    fsManager.serialize = function(resource, obj)
    {
        if(resource.constructor !== ftpGateway.FTPGateway)
            return null;

        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            name: resource.name,
            rootPath: resource.rootPath
        };
    }

    fsManager.unserialize = function(data, obj)
    {
        const rs = new ftpGateway.FTPGateway(this.config, data.rootPath, data.name, null, this);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    }

    fsManager.newResource = function(fullPath, name, type, parent)
    {
        const parentRemotePath = parent.constructor === ftpGateway.FTPGateway ? parent.rootPath : parent .remotePath;
        let remotepath;
        if(parentRemotePath.lastIndexOf('/') === parentRemotePath.length - 1)
            remotepath = parentRemotePath + name;
        else
            remotepath = parentRemotePath + '/' + name;
        
        let gateway = parent;
        while(gateway && gateway.constructor !== ftpGateway.FTPGateway)
            gateway = gateway.parent;

        if(type.isFile)
            return new ftpResource.FTPFile(gateway, null, remotepath, parent, this);
        else if(type.isDirectory)
            return new ftpResource.FTPFolder(gateway, null, remotepath, parent, this);

        throw webdav.Errors.InvalidOperation;
    }

    return fsManager;
}
