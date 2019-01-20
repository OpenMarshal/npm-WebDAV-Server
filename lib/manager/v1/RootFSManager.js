"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualFSManager_1 = require("./VirtualFSManager");
var VirtualFolder_1 = require("../../resource/v1/virtual/VirtualFolder");
var RootResource_1 = require("../../resource/v1/std/RootResource");
var VirtualFile_1 = require("../../resource/v1/virtual/VirtualFile");
var Errors_1 = require("../../Errors");
var virtualFSManager = new VirtualFSManager_1.VirtualFSManager();
var RootFSManager = /** @class */ (function () {
    function RootFSManager() {
        this.uid = 'RootFSManager_1.0.2';
    }
    RootFSManager.prototype.serialize = function (resource, obj) {
        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties
        };
    };
    RootFSManager.prototype.unserialize = function (data, obj) {
        var rs = new RootResource_1.RootResource();
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    };
    RootFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        if (type.isDirectory)
            return new VirtualFolder_1.VirtualFolder(name, parent, virtualFSManager);
        if (type.isFile)
            return new VirtualFile_1.VirtualFile(name, parent, virtualFSManager);
        throw Errors_1.Errors.UnrecognizedResource;
    };
    return RootFSManager;
}());
exports.RootFSManager = RootFSManager;
