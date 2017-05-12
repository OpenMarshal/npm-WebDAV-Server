"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = require("./Resource");
var ResourceChildren_1 = require("./ResourceChildren");
var VirtualFSManager_1 = require("../manager/VirtualFSManager");
var mimeTypes = require("mime-types");
var VirtualResource = (function (_super) {
    __extends(VirtualResource, _super);
    function VirtualResource(name, parent, fsManager) {
        var _this = this;
        if (!fsManager)
            if (parent && parent.fsManager && parent.fsManager.constructor === VirtualFSManager_1.VirtualFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = VirtualFSManager_1.VirtualFSManager.Instance();
        _this = _super.call(this, parent, fsManager) || this;
        _this.name = name;
        return _this;
    }
    VirtualResource.prototype.create = function (callback) {
        callback(null);
    };
    VirtualResource.prototype.delete = function (callback) {
        this.removeFromParent(callback);
    };
    VirtualResource.prototype.moveTo = function (to, callback) {
        callback(new Error('Not implemented yet.'), null, null);
    };
    VirtualResource.prototype.rename = function (newName, callback) {
        var oldName = this.name;
        this.name = newName;
        callback(null, oldName, newName);
    };
    VirtualResource.prototype.webName = function (callback) {
        callback(null, this.name);
    };
    return VirtualResource;
}(Resource_1.StandardResource));
exports.VirtualResource = VirtualResource;
var VirtualFolder = (function (_super) {
    __extends(VirtualFolder, _super);
    function VirtualFolder(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    VirtualFolder.prototype.type = function (callback) {
        callback(null, Resource_1.ResourceType.Directory);
    };
    VirtualFolder.prototype.append = function (data, callback) {
        callback(new Error('Invalid operation'));
    };
    VirtualFolder.prototype.write = function (data, callback) {
        callback(new Error('Invalid operation'));
    };
    VirtualFolder.prototype.read = function (callback) {
        callback(new Error('Invalid operation'), null);
    };
    VirtualFolder.prototype.mimeType = function (callback) {
        callback(null, 'directory');
    };
    VirtualFolder.prototype.size = function (callback) {
        Resource_1.StandardResource.sizeOfSubFiles(this, callback);
    };
    VirtualFolder.prototype.addChild = function (resource, callback) {
        var _this = this;
        this.children.add(resource, function (e) {
            if (!e)
                resource.parent = _this;
            callback(e);
        });
    };
    VirtualFolder.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, callback);
    };
    VirtualFolder.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return VirtualFolder;
}(VirtualResource));
exports.VirtualFolder = VirtualFolder;
var VirtualFile = (function (_super) {
    __extends(VirtualFile, _super);
    function VirtualFile(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.content = new Buffer(0);
        return _this;
    }
    VirtualFile.prototype.type = function (callback) {
        callback(null, Resource_1.ResourceType.File);
    };
    VirtualFile.prototype.create = function (callback) {
        callback(null);
    };
    VirtualFile.prototype.delete = function (callback) {
        this.removeFromParent(callback);
    };
    VirtualFile.prototype.append = function (data, callback) {
        var newContent = new Int8Array(this.content.length + data.length);
        for (var i = 0; i < this.content.length; ++i)
            newContent[i] = this.content[i];
        for (var i = 0; i < data.length; ++i)
            newContent[i + this.content.length] = data[i];
        this.content = newContent;
        callback(null);
    };
    VirtualFile.prototype.write = function (data, callback) {
        this.content = data;
        callback(null);
    };
    VirtualFile.prototype.read = function (callback) {
        callback(null, this.content);
    };
    VirtualFile.prototype.mimeType = function (callback) {
        var mt = mimeTypes.lookup(this.name);
        callback(mt ? null : new Error('Unkown mime type'), mt);
    };
    VirtualFile.prototype.size = function (callback) {
        callback(null, this.content.length);
    };
    VirtualFile.prototype.addChild = function (resource, callback) {
        callback(new Error('Invalid operation'));
    };
    VirtualFile.prototype.removeChild = function (resource, callback) {
        callback(new Error('Invalid operation'));
    };
    VirtualFile.prototype.getChildren = function (callback) {
        callback(new Error('Invalid operation'), null);
    };
    return VirtualFile;
}(VirtualResource));
exports.VirtualFile = VirtualFile;
