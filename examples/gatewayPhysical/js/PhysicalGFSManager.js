"use strict";
const webdav = require('../../../lib/index.js'),
      FTPClient = require('ftp'),
      PhysicalGateway = require('./PhysicalGateway.js').PhysicalGateway;

module.exports.PhysicalGFSManager = function(config)
{
    const fsManager = new webdav.PhysicalFSManager();
    fsManager.constructor = module.exports.PhysicalGFSManager;

    fsManager.uid = "PhysicalGFSManager_1.0.0";
    
    fsManager.serialize = function(resource, obj)
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

    fsManager.unserialize = function(data, obj)
    {
        const rs = new PhysicalGateway(data.realPath, data.customName, null, this);
        
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;

        return rs;
    }

    return fsManager;
}
