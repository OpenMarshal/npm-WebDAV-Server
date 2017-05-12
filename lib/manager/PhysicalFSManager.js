"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalResource_1 = require("../resource/PhysicalResource");
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
        return { realPath: resource.realPath, isFile: resource.constructor === PhysicalResource_1.PhysicalFile };
    };
    PhysicalFSManager.prototype.unserialize = function (serializedResource) {
        if (serializedResource.realPath) {
            if (serializedResource.isFile)
                return new PhysicalResource_1.PhysicalFile(serializedResource.realPath, null, this);
            else
                return new PhysicalResource_1.PhysicalFolder(serializedResource.realPath, null, this);
        }
        throw new Error('Unrecognized resource');
    };
    PhysicalFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        throw new Error('Not implemented yet');
    };
    return PhysicalFSManager;
}());
exports.PhysicalFSManager = PhysicalFSManager;
