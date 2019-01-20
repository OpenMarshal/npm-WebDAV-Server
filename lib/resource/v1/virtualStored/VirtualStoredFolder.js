"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var IResource_1 = require("../IResource");
var ResourceChildren_1 = require("../std/ResourceChildren");
var VirtualStoredResource_1 = require("./VirtualStoredResource");
var Errors_1 = require("../../../Errors");
var VirtualStoredFolder = /** @class */ (function (_super) {
    __extends(VirtualStoredFolder, _super);
    function VirtualStoredFolder(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    // ****************************** Std meta-data ****************************** //
    VirtualStoredFolder.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.Directory);
    };
    // ****************************** Content ****************************** //
    VirtualStoredFolder.prototype.write = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    VirtualStoredFolder.prototype.read = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    VirtualStoredFolder.prototype.mimeType = function (targetSource, callback) {
        callback(Errors_1.Errors.NoMimeTypeForAFolder, null);
    };
    VirtualStoredFolder.prototype.size = function (targetSource, callback) {
        callback(Errors_1.Errors.NoSizeForAFolder, null);
    };
    // ****************************** Children ****************************** //
    VirtualStoredFolder.prototype.addChild = function (resource, callback) {
        var _this = this;
        this.children.add(resource, function (e) {
            if (!e)
                resource.parent = _this;
            callback(e);
        });
    };
    VirtualStoredFolder.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, function (e) {
            if (!e)
                resource.parent = null;
            callback(e);
        });
    };
    VirtualStoredFolder.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return VirtualStoredFolder;
}(VirtualStoredResource_1.VirtualStoredResource));
exports.VirtualStoredFolder = VirtualStoredFolder;
