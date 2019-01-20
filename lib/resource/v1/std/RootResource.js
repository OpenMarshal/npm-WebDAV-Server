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
var StandardResource_1 = require("./StandardResource");
var ResourceChildren_1 = require("./ResourceChildren");
var RootFSManager_1 = require("../../../manager/v1/RootFSManager");
var Errors_1 = require("../../../Errors");
var RootResource = /** @class */ (function (_super) {
    __extends(RootResource, _super);
    function RootResource() {
        var _this = _super.call(this, null, new RootFSManager_1.RootFSManager()) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    // ****************************** Actions ****************************** //
    RootResource.prototype.create = function (callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    RootResource.prototype.delete = function (callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    RootResource.prototype.moveTo = function (parent, newName, overwrite, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    RootResource.prototype.rename = function (newName, callback) {
        callback(Errors_1.Errors.InvalidOperation, null, null);
    };
    // ****************************** Std meta-data ****************************** //
    RootResource.prototype.webName = function (callback) {
        callback(null, '');
    };
    RootResource.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.Directory);
    };
    // ****************************** Content ****************************** //
    RootResource.prototype.write = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    RootResource.prototype.read = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    RootResource.prototype.mimeType = function (targetSource, callback) {
        callback(null, 'directory');
    };
    RootResource.prototype.size = function (targetSource, callback) {
        StandardResource_1.StandardResource.sizeOfSubFiles(this, targetSource, callback);
    };
    // ****************************** Children ****************************** //
    RootResource.prototype.addChild = function (resource, callback) {
        var _this = this;
        this.children.add(resource, function (e) {
            if (!e)
                resource.parent = _this;
            callback(e);
        });
    };
    RootResource.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, callback);
    };
    RootResource.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return RootResource;
}(StandardResource_1.StandardResource));
exports.RootResource = RootResource;
