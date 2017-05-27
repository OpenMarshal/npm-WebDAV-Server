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
var stream_1 = require("stream");
var VirtualResource_1 = require("./VirtualResource");
var Errors_1 = require("../../Errors");
var mimeTypes = require("mime-types");
var VirtualFileReadable = (function (_super) {
    __extends(VirtualFileReadable, _super);
    function VirtualFileReadable(contents, options) {
        var _this = _super.call(this, options) || this;
        _this.contents = contents;
        _this.blockIndex = -1;
        return _this;
    }
    VirtualFileReadable.prototype._read = function (size) {
        while (true) {
            ++this.blockIndex;
            if (this.blockIndex >= this.contents.length) {
                this.push(null);
                break;
            }
            if (!this.push(this.contents[this.blockIndex]))
                break;
        }
    };
    return VirtualFileReadable;
}(stream_1.Readable));
exports.VirtualFileReadable = VirtualFileReadable;
var VirtualFile = (function (_super) {
    __extends(VirtualFile, _super);
    function VirtualFile(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.content = [];
        _this.len = 0;
        return _this;
    }
    VirtualFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    VirtualFile.prototype.append = function (data, targetSource, callback) {
        this.content.push(data);
        this.len += data.length;
        this.updateLastModified();
        callback(null);
    };
    VirtualFile.prototype.write = function (data, targetSource, callback) {
        this.content = [data];
        this.len = data.length;
        this.updateLastModified();
        callback(null);
    };
    VirtualFile.prototype.read = function (targetSource, callback) {
        callback(null, new VirtualFileReadable(this.content));
    };
    VirtualFile.prototype.mimeType = function (targetSource, callback) {
        var mt = mimeTypes.lookup(this.name);
        callback(null, mt ? mt : 'application/octet-stream');
    };
    VirtualFile.prototype.size = function (targetSource, callback) {
        callback(null, this.len);
    };
    VirtualFile.prototype.addChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualFile.prototype.removeChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualFile.prototype.getChildren = function (callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    return VirtualFile;
}(VirtualResource_1.VirtualResource));
exports.VirtualFile = VirtualFile;
