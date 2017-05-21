"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalFolder_1 = require("../resource/physical/PhysicalFolder");
var PhysicalFile_1 = require("../resource/physical/PhysicalFile");
var path = require("path");
var PhysicalFSManager = (function () {
    function PhysicalFSManager() {
        this.uid = 'PhysicalFSManager_1.0.2';
    }
    PhysicalFSManager.prototype.serialize = function (resource, obj) {
        if (!resource.realPath)
            throw new Error('Unrecognized resource');
        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        };
    };
    PhysicalFSManager.prototype.unserialize = function (data, obj) {
        var rs;
        if (obj.type.isFile)
            rs = new PhysicalFile_1.PhysicalFile(data.realPath, null, this);
        else
            rs = new PhysicalFolder_1.PhysicalFolder(data.realPath, null, this);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.lockBag.locks = data.locks;
        rs.properties = data.properties;
        return rs;
    };
    PhysicalFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        var parentRealPath = parent.realPath;
        if (!parentRealPath)
            throw new Error('Can\'t create a physical resource with a non-physical parent');
        var newRealPath = path.join(parentRealPath, name);
        if (type.isDirectory)
            return new PhysicalFolder_1.PhysicalFolder(newRealPath, parent, this);
        else
            return new PhysicalFile_1.PhysicalFile(newRealPath, parent, this);
    };
    return PhysicalFSManager;
}());
exports.PhysicalFSManager = PhysicalFSManager;
