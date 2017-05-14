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
var VirtualResource_1 = require("./VirtualResource");
var mimeTypes = require("mime-types");
var VirtualFile = (function (_super) {
    __extends(VirtualFile, _super);
    function VirtualFile(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.content = new Buffer(0);
        return _this;
    }
    VirtualFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    VirtualFile.prototype.append = function (data, callback) {
        var newContent = new Int8Array(this.content.length + data.length);
        for (var i = 0; i < this.content.length; ++i)
            newContent[i] = this.content[i];
        for (var i = 0; i < data.length; ++i)
            newContent[i + this.content.length] = data[i];
        this.content = newContent;
        this.updateLastModified();
        callback(null);
    };
    VirtualFile.prototype.write = function (data, callback) {
        this.content = data;
        this.updateLastModified();
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
}(VirtualResource_1.VirtualResource));
exports.VirtualFile = VirtualFile;
