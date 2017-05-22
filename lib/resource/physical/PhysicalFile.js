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
var PhysicalResource_1 = require("./PhysicalResource");
var Errors_1 = require("../../Errors");
var mimeTypes = require("mime-types");
var fs = require("fs");
var PhysicalFile = (function (_super) {
    __extends(PhysicalFile, _super);
    function PhysicalFile(realPath, parent, fsManager) {
        return _super.call(this, realPath, parent, fsManager) || this;
    }
    PhysicalFile.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.File);
    };
    PhysicalFile.prototype.create = function (callback) {
        if (!fs.constants || !fs.constants.O_CREAT) {
            fs.writeFile(this.realPath, '', callback);
        }
        else {
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
        fs.unlink(this.realPath, function (e) {
            if (e)
                callback(e);
            else
                _this.removeFromParent(callback);
        });
    };
    PhysicalFile.prototype.append = function (data, targetSource, callback) {
        var _this = this;
        fs.appendFile(this.realPath, data, function (e) {
            if (e)
                callback(e);
            else {
                _this.updateLastModified();
                callback(null);
            }
        });
    };
    PhysicalFile.prototype.write = function (data, targetSource, callback) {
        var _this = this;
        fs.writeFile(this.realPath, data, function (e) {
            if (e)
                callback(e);
            else {
                _this.updateLastModified();
                callback(null);
            }
        });
    };
    PhysicalFile.prototype.read = function (targetSource, callback) {
        fs.readFile(this.realPath, callback);
    };
    PhysicalFile.prototype.mimeType = function (targetSource, callback) {
        var mt = mimeTypes.lookup(this.realPath);
        callback(null, mt ? mt : 'application/octet-stream');
    };
    PhysicalFile.prototype.size = function (targetSource, callback) {
        fs.stat(this.realPath, function (e, s) { return callback(e, s ? s.size : null); });
    };
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
