"use strict";
const webdav = require('webdav-server'),
      FTPClient = require('ftp'),
      physicalGateway = require('./PhysicalGateway.js');

module.exports.PhysicalGFSManager = function()
{
    const fsManager = new webdav.PhysicalFSManager();
    fsManager.constructor = module.exports.PhysicalGFSManager;

    fsManager.uid = "PhysicalGFSManager_1.0.0";
    
    fsManager.serialize = function(resource, obj)
    {
        if(resource.constructor !== physicalGateway.PhysicalGateway)
            return null;

        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            customName: resource.customName
        };
    }

    fsManager.unserialize = function(data, obj)
    {
        const rs = new physicalGateway.PhysicalGateway(data.realPath, data.customName, null, this);
        
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;

        return rs;
    }

    return fsManager;
}
