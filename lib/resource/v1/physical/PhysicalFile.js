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
var PhysicalResource_1 = require("./PhysicalResource");
var Errors_1 = require("../../../Errors");
var mimeTypes = require("mime-types");
var fs = require("fs");
var PhysicalFile = /** @class */ (function (_super) {
    __extends(PhysicalFile, _super);
    function PhysicalFile(realPath, parent, fsManager) {
        return _super.call(this, realPath, parent, fsManager) || this;
    }
    // ****************************** Std meta-data ****************************** //
    PhysicalFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    // ****************************** Actions ****************************** //
    PhysicalFile.prototype.create = function (callback) {
        callback = this.wrapCallback(callback);
        if (!fs.constants || !fs.constants.O_CREAT) { // node v5.* and lower
            fs.writeFile(this.realPath, '', callback);
        }
        else { // node v6.* and higher
            fs.open(this.realPath, fs.constants.O_CREAT, function (e, fd) {
                if (e)
                    callback(e);
                else
                    fs.close(fd, function (e) {
                        callback(e);
                    });
            });
        }
    };
    PhysicalFile.prototype.delete = function (callback) {
        var _this = this;
        callback = this.wrapCallback(callback);
        fs.unlink(this.realPath, function (e) {
            if (e)
                callback(e);
            else
                _this.removeFromParent(callback);
        });
    };
    // ****************************** Content ****************************** //
    PhysicalFile.prototype.write = function (targetSource, callback) {
        var _this = this;
        callback = this.wrapCallback(callback);
        fs.open(this.realPath, 'w', function (e, fd) {
            if (e) {
                callback(e, null);
                return;
            }
            callback(null, fs.createWriteStream(null, { fd: fd }));
            _this.updateLastModified();
        });
    };
    PhysicalFile.prototype.read = function (targetSource, callback) {
        var _this = this;
        callback = this.wrapCallback(callback);
        fs.open(this.realPath, 'r', function (e, fd) {
            if (e) {
                callback(e, null);
                return;
            }
            callback(null, fs.createReadStream(null, { fd: fd }));
            _this.updateLastModified();
        });
    };
    PhysicalFile.prototype.mimeType = function (targetSource, callback) {
        callback = this.wrapCallback(callback);
        var mt = mimeTypes.contentType(this.realPath);
        callback(null, mt ? mt : 'application/octet-stream');
    };
    PhysicalFile.prototype.size = function (targetSource, callback) {
        callback = this.wrapCallback(callback);
        fs.stat(this.realPath, function (e, s) { return callback(e, s ? s.size : null); });
    };
    // ****************************** Children ****************************** //
    PhysicalFile.prototype.addChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    PhysicalFile.prototype.removeChild = function (resource, callback) {
        callback(Errors_1.Errors.InvalidOperation);
    };
    PhysicalFile.prototype.getChildren = function (callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    return PhysicalFile;
}(PhysicalResource_1.PhysicalResource));
exports.PhysicalFile = PhysicalFile;
