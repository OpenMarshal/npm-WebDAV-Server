"use strict";
const webdav = require('webdav-server'),
      request = require('request'),
      webFSManager = require('./fsManager.js');

module.exports.WebFile = function(webUrl, fileName, refreshTimeoutMs = 10000)
{
    const stdRes = new webdav.StandardResource(null, new webFSManager.WebFSManager());

    stdRes.refreshTimeoutMs = refreshTimeoutMs;
    stdRes.lenUpdateTime = 0;
    stdRes.fileName = fileName;
    stdRes.webUrl = webUrl;
    stdRes.len = -1;

    stdRes.openReadStream = function()
    {
        let size = 0;
        const stream = request.get(this.webUrl);
        stream.on('data', (chunk) => {
            size = chunk.length;
        })
        stream.on('end', () => {
            this.len = size;
            this.lenUpdateTime = Date.now();
        })
        stream.end();
        return stream;
    };

    stdRes.create = function(callback)
    {
        callback();
    };
        
    stdRes.delete = function(callback)
    {
        webdav.StandardResource.standardRemoveFromParent(this, callback);
    }

    stdRes.moveTo = function(parent, newName, overwrite, callback)
    {
        webdav.StandardResource.standardMoveTo(this, parent, newName, overwrite, callback);
    }

    stdRes.rename = function(newName, callback)
    {
        const oldname = this.fileName;
        this.fileName = newName;
        callback(null, oldname, newName);
    }

    stdRes.write = function(targetSource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }

    stdRes.read = function(targetSource, callback)
    {
        callback(null, this.openReadStream());
    }

    stdRes.mimeType = function(targetSource, callback)
    {
        webdav.StandardResource.standardMimeType(this, targetSource, callback);
    }

    stdRes.size = function(targetSource, callback)
    {
        if(this.len >= 0 && Date.now() - this.lenUpdateTime < this.refreshTimeoutMs)
        {
            callback(null, this.len);
            return;
        }

        const stream = this.openReadStream();
        stream.on('end', () => callback(null, this.len));
    }

    stdRes.webName = function(callback)
    {
        callback(null, this.fileName);
    }

    stdRes.type = function(callback)
    {
        callback(null, webdav.ResourceType.File);
    }

    stdRes.addChild = function(resource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }
    stdRes.removeChild = function(resource, callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }
    stdRes.getChildren = function(callback)
    {
        callback(webdav.Errors.InvalidOperation);
    }


    return stdRes;
}
