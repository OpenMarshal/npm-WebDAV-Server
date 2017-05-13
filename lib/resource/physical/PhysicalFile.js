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
        fs.open(this.realPath, fs.constants.O_CREAT, function (e, fd) {
            if (e)
                callback(e);
            else
                fs.close(fd, function (e) {
                    callback(e);
                });
        });
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
    PhysicalFile.prototype.append = function (data, callback) {
        fs.appendFile(this.realPath, data, callback);
    };
    PhysicalFile.prototype.write = function (data, callback) {
        fs.writeFile(this.realPath, data, callback);
    };
    PhysicalFile.prototype.read = function (callback) {
        fs.readFile(this.realPath, callback);
    };
    PhysicalFile.prototype.mimeType = function (callback) {
        var mt = mimeTypes.lookup(this.realPath);
        callback(mt ? null : new Error('application/octet-stream'), mt);
    };
    PhysicalFile.prototype.size = function (callback) {
        fs.stat(this.realPath, function (e, s) { return callback(e, s ? s.size : null); });
    };
    PhysicalFile.prototype.addChild = function (resource, callback) {
        callback(new Error('Invalid operation'));
    };
    PhysicalFile.prototype.removeChild = function (resource, callback) {
        callback(new Error('Invalid operation'));
    };
    PhysicalFile.prototype.getChildren = function (callback) {
        callback(new Error('Invalid operation'), null);
    };
    return PhysicalFile;
}(PhysicalResource_1.PhysicalResource));
exports.PhysicalFile = PhysicalFile;
