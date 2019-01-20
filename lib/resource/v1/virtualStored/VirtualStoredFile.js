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
var VirtualStoredResource_1 = require("./VirtualStoredResource");
var Errors_1 = require("../../../Errors");
var mimeTypes = require("mime-types");
var VirtualStoredFile = /** @class */ (function (_super) {
    __extends(VirtualStoredFile, _super);
    function VirtualStoredFile(name, parent, fsManager) {
        var _this = _super.call(this, name, parent, fsManager) || this;
        _this.contentUid = null;
        _this.len = 0;
        return _this;
    }
    VirtualStoredFile.prototype.create = function (callback) {
        var _this = this;
        if (this.contentUid) {
            callback(null);
            return;
        }
        this.fsManager.contentManager.allocate(function (e, contentUid) {
            _this.contentUid = contentUid;
            callback(e);
        });
    };
    VirtualStoredFile.prototype.delete = function (callback) {
        var _this = this;
        this.fsManager.contentManager.deallocate(this.contentUid, function (e) {
            if (e)
                callback(e);
            else
                _this.removeFromParent(callback);
        });
    };
    // ****************************** Std meta-data ****************************** //
    VirtualStoredFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    // ****************************** Content ****************************** //
    VirtualStoredFile.prototype.write = function (targetSource, callback) {
        var _this = this;
        this.fsManager.contentManager.write(this.contentUid, function (e, w) {
            if (e) {
                callback(e, null);
                return;
            }
            var size = 0;
            var wr = new stream_1.Transform({
                transform: function (chunk, encoding, cb) {
                    size += chunk.length;
                    this.push(chunk);
                    cb();
                }
            });
            wr.on('finish', function () {
                _this.updateLastModified();
                _this.len = size;
            });
            wr.pipe(w);
            callback(null, wr);
        });
    };
    VirtualStoredFile.prototype.read = function (targetSource, callback) {
        this.fsManager.contentManager.read(this.contentUid, callback);
    };
    VirtualStoredFile.prototype.mimeType = function (targetSource, callback) {
        var mt = mimeTypes.contentType(this.name);
        callback(null, mt ? mt : 'application/octet-stream');
    };
    VirtualStoredFile.prototype.size = function (targetSource, callback) {
        callback(null, this.len);
    };
    // ****************************** Children ****************************** //
    VirtualStoredFile.prototype.addChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualStoredFile.prototype.removeChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    VirtualStoredFile.prototype.getChildren = function (callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    return VirtualStoredFile;
}(VirtualStoredResource_1.VirtualStoredResource));
exports.VirtualStoredFile = VirtualStoredFile;
