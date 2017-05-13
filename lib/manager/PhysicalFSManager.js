"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalFolder_1 = require("../resource/physical/PhysicalFolder");
var PhysicalFile_1 = require("../resource/physical/PhysicalFile");
var path = require("path");
var PhysicalFSManager = (function () {
    function PhysicalFSManager() {
    }
    PhysicalFSManager.instance = function () {
        if (!this._instance)
            this._instance = new PhysicalFSManager();
        return this._instance;
    };
    PhysicalFSManager.prototype.serialize = function (resource) {
        if (!resource.realPath)
            throw new Error('Unrecognized resource');
        return { realPath: resource.realPath, isFile: resource.constructor === PhysicalFile_1.PhysicalFile };
    };
    PhysicalFSManager.prototype.unserialize = function (serializedResource) {
        if (serializedResource.realPath) {
            if (serializedResource.isFile)
                return new PhysicalFile_1.PhysicalFile(serializedResource.realPath, null, this);
            else
                return new PhysicalFolder_1.PhysicalFolder(serializedResource.realPath, null, this);
        }
        throw new Error('Unrecognized resource');
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
