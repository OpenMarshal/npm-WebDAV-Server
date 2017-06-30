const webdav = require('webdav-server'),
      webFile = require('./resource.js');

module.exports.WebFSManager = function()
{
    const fsManager = { };
    fsManager.uid = 'WebFSManager_1.0.0';
      
    fsManager.serialize = function(resource, obj)
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

    fsManager.unserialize = function(data, obj)
    {
        const rs = new webFile.WebFile(data.webUrl, data.fileName, data.refreshTimeoutMS);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    }

    fsManager.newResource = function(fullPath, name, type, parent)
    {
        throw webdav.Errors.InvalidOperation;
    }

    return fsManager;
}
