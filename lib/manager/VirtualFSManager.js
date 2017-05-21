"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualFolder_1 = require("../resource/virtual/VirtualFolder");
var VirtualFile_1 = require("../resource/virtual/VirtualFile");
var VirtualFSManager = (function () {
    function VirtualFSManager() {
        this.uid = 'VirtualFSManager_1.0.2';
    }
    VirtualFSManager.prototype.serialize = function (resource, obj) {
        var result = {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        };
        result.name = resource.name;
        if (resource.content)
            result.content = resource.content;
        return result;
    };
    VirtualFSManager.prototype.unserialize = function (data, obj) {
        if (obj.type.isDirectory) {
            var rs = new VirtualFolder_1.VirtualFolder(data.name, null, this);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }
        if (obj.type.isFile) {
            var rs = new VirtualFile_1.VirtualFile(data.name, null, this);
            if (data.content)
                rs.content = new Buffer(data.content);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }
        throw new Error('Unrecognized resource');
    };
    VirtualFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        if (type.isDirectory)
            return new VirtualFolder_1.VirtualFolder(name, parent, this);
        if (type.isFile)
            return new VirtualFile_1.VirtualFile(name, parent, this);
        throw new Error('Unrecognized type');
    };
    return VirtualFSManager;
}());
exports.VirtualFSManager = VirtualFSManager;
