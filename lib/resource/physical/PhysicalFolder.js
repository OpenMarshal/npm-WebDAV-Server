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
var ResourceChildren_1 = require("../std/ResourceChildren");
var PhysicalResource_1 = require("./PhysicalResource");
var Errors_1 = require("../../Errors");
var fs = require("fs");
var PhysicalFolder = (function (_super) {
    __extends(PhysicalFolder, _super);
    function PhysicalFolder(realPath, parent, fsManager) {
        var _this = _super.call(this, realPath, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    PhysicalFolder.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.Directory);
    };
    PhysicalFolder.prototype.create = function (callback) {
        fs.mkdir(this.realPath, callback);
    };
    PhysicalFolder.prototype.delete = function (callback) {
        var _this = this;
        this.getChildren(function (e, children) {
            if (e) {
                callback(e);
                return;
            }
            if (children.length === 0) {
                fs.rmdir(_this.realPath, function (e) {
                    if (e)
                        callback(e);
                    else
                        _this.removeFromParent(callback);
                });
                return;
            }
            var nb = children.length;
            var go = function (e) {
                if (nb <= 0)
                    return;
                --nb;
                if (e) {
                    nb = -1;
                    callback(e);
                    return;
                }
                if (nb === 0) {
                    fs.rmdir(_this.realPath, function (e) {
                        if (e)
                            callback(e);
                        else
                            _this.removeFromParent(callback);
                    });
                }
            };
            children.forEach(function (child) {
                process.nextTick(function () { return child.delete(go); });
            });
        });
    };
    PhysicalFolder.prototype.write = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    PhysicalFolder.prototype.read = function (targetSource, callback) {
        callback(Errors_1.Errors.InvalidOperation, null);
    };
    PhysicalFolder.prototype.mimeType = function (targetSource, callback) {
        callback(Errors_1.Errors.NoMimeTypeForAFolder, null);
    };
    PhysicalFolder.prototype.size = function (targetSource, callback) {
        callback(Errors_1.Errors.NoSizeForAFolder, null);
    };
    PhysicalFolder.prototype.addChild = function (resource, callback) {
        var _this = this;
        this.children.add(resource, function (e) {
            if (!e)
                resource.parent = _this;
            callback(e);
        });
    };
    PhysicalFolder.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, function (e) {
            if (!e)
                resource.parent = null;
            callback(e);
        });
    };
    PhysicalFolder.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return PhysicalFolder;
}(PhysicalResource_1.PhysicalResource));
exports.PhysicalFolder = PhysicalFolder;
