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
var stream_1 = require("stream");
var VirtualResource_1 = require("./VirtualResource");
var Errors_1 = require("../../../Errors");
var mimeTypes = require("mime-types");
var VirtualFileReadable = /** @class */ (function (_super) {
    __extends(VirtualFileReadable, _super);
    function VirtualFileReadable(contents) {
        var _this = _super.call(this) || this;
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
var VirtualFileWritable = /** @class */ (function (_super) {
    __extends(VirtualFileWritable, _super);
    function VirtualFileWritable(contents) {
        var _this = _super.call(this, null) || this;
        _this.contents = contents;
        return _this;
    }
    VirtualFileWritable.prototype._write = function (chunk, encoding, callback) {
        this.contents.push(chunk);
        callback(null);
    };
    return VirtualFileWritable;
}(stream_1.Writable));
exports.VirtualFileWritable = VirtualFileWritable;
var VirtualFile = /** @class */ (function (_super) {
    __extends(VirtualFile, _super);
    function VirtualFile(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.content = [];
        _this.len = 0;
        return _this;
    }
    // ****************************** Std meta-data ****************************** //
    VirtualFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    // ****************************** Content ****************************** //
    VirtualFile.prototype.write = function (targetSource, callback) {
        var _this = this;
        var content = [];
        var stream = new VirtualFileWritable(content);
        stream.on('finish', function () {
            _this.content = content;
            _this.len = content.map(function (c) { return c.length; }).reduce(function (s, n) { return s + n; }, 0);
            _this.updateLastModified();
        });
        callback(null, stream);
    };
    VirtualFile.prototype.read = function (targetSource, callback) {
        callback(null, new VirtualFileReadable(this.content));
    };
    VirtualFile.prototype.mimeType = function (targetSource, callback) {
        var mt = mimeTypes.contentType(this.name);
        callback(null, mt ? mt : 'application/octet-stream');
    };
    VirtualFile.prototype.size = function (targetSource, callback) {
        callback(null, this.len);
    };
    // ****************************** Children ****************************** //
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
