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
var RootResource = (function (_super) {
    __extends(RootResource, _super);
    function RootResource() {
        var _this = _super.call(this, null, null) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    RootResource.prototype.create = function (callback) {
        callback(new Error('Illegal operation.'));
    };
    RootResource.prototype.delete = function (callback) {
        callback(new Error('Illegal operation.'));
    };
    RootResource.prototype.moveTo = function (to, callback) {
        callback(new Error('Illegal operation.'), null, null);
    };
    RootResource.prototype.rename = function (newName, callback) {
        callback(new Error('Illegal operation.'), null, null);
    };
    RootResource.prototype.webName = function (callback) {
        callback(null, '');
    };
    RootResource.prototype.type = function (callback) {
        callback(null, Resource_1.ResourceType.Directory);
    };
    RootResource.prototype.append = function (data, callback) {
        callback(new Error('Illegal operation.'));
    };
    RootResource.prototype.write = function (data, callback) {
        callback(new Error('Illegal operation.'));
    };
    RootResource.prototype.read = function (callback) {
        callback(new Error('Illegal operation.'), null);
    };
    RootResource.prototype.mimeType = function (callback) {
        callback(null, 'directory');
    };
    RootResource.prototype.size = function (callback) {
        Resource_1.StandardResource.sizeOfSubFiles(this, callback);
    };
    RootResource.prototype.addChild = function (resource, callback) {
        this.children.add(resource, callback);
    };
    RootResource.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, callback);
    };
    RootResource.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return RootResource;
}(Resource_1.StandardResource));
exports.RootResource = RootResource;
