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
var IResource_1 = require("../IResource");
var StandardResource_1 = require("../std/StandardResource");
var ResourceChildren_1 = require("../std/ResourceChildren");
var VirtualResource_1 = require("./VirtualResource");
var Errors_1 = require("../../Errors");
var VirtualFolder = (function (_super) {
    __extends(VirtualFolder, _super);
    function VirtualFolder(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    VirtualFolder.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.Directory);
    };
    VirtualFolder.prototype.append = function (data, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualFolder.prototype.write = function (data, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualFolder.prototype.read = function (callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    VirtualFolder.prototype.mimeType = function (callback) {
        callback(null, 'directory');
    };
    VirtualFolder.prototype.size = function (callback) {
        StandardResource_1.StandardResource.sizeOfSubFiles(this, callback);
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
}(VirtualResource_1.VirtualResource));
exports.VirtualFolder = VirtualFolder;
