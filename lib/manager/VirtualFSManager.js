"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualResource_1 = require("../resource/VirtualResource");
var VirtualFSManager = (function () {
    function VirtualFSManager() {
    }
    VirtualFSManager.instance = function () {
        if (!this._instance)
            this._instance = new VirtualFSManager();
        return this._instance;
    };
    VirtualFSManager.prototype.serialize = function (resource) {
        var obj;
        obj.name = resource.name;
        if (resource.children)
            obj.children = resource.children;
        if (resource.content)
            obj.content = resource.content;
        return obj;
    };
    VirtualFSManager.prototype.unserialize = function (serializedResource) {
        if (serializedResource.children) {
            var rs = new VirtualResource_1.VirtualFolder(serializedResource.name, null, this);
            rs.children = serializedResource.children;
            return rs;
        }
        if (serializedResource.content) {
            var rs = new VirtualResource_1.VirtualFile(serializedResource.name, null, this);
            rs.content = serializedResource.content;
            return rs;
        }
        throw new Error('Unrocognized resource');
    };
    VirtualFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        if (type.isDirectory)
            return new VirtualResource_1.VirtualFolder(name, parent, this);
        if (type.isFile)
            return new VirtualResource_1.VirtualFile(name, parent, this);
        throw new Error('Unrocognized type');
    };
    return VirtualFSManager;
}());
exports.VirtualFSManager = VirtualFSManager;
