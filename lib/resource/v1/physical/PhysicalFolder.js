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
var ResourceChildren_1 = require("../std/ResourceChildren");
var PhysicalResource_1 = require("./PhysicalResource");
var PhysicalFile_1 = require("./PhysicalFile");
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var path = require("path");
var fs = require("fs");
function loader(fpath, callback) {
    fs.readdir(fpath, function (e, files) {
        if (e)
            throw e;
        new Workflow_1.Workflow()
            .each(files, function (file, cb) {
            var fullPath = path.join(fpath, file);
            fs.stat(fullPath, function (e, stat) {
                if (e)
                    cb(e);
                else if (stat.isFile())
                    cb(null, new PhysicalFile_1.PhysicalFile(fullPath));
                else {
                    var folder_1 = new PhysicalFolder(fullPath);
                    loader(fullPath, function (e, resources) {
                        if (e)
                            cb(e);
                        else {
                            new Workflow_1.Workflow()
                                .each(resources, function (r, cb) { return folder_1.addChild(r, cb); })
                                .error(cb)
                                .done(function () { return cb(null, folder_1); });
                        }
                    });
                }
            });
        })
            .error(callback)
            .done(function (resources) { return callback(null, resources); });
    });
}
var PhysicalFolder = /** @class */ (function (_super) {
    __extends(PhysicalFolder, _super);
    function PhysicalFolder(realPath, parent, fsManager) {
        var _this = _super.call(this, realPath, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    // ****************************** Std meta-data ****************************** //
    PhysicalFolder.prototype.type = function (callback) {
        callback(null, IResource_1.ResourceType.Directory);
    };
    // ****************************** Actions ****************************** //
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
    // ****************************** Content ****************************** //
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
    // ****************************** Children ****************************** //
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
    PhysicalFolder.loadFromPath = function (path, callback) {
        loader(path, function (e, resources) {
            if (!e) {
                var folder_2 = new PhysicalFolder(path);
                new Workflow_1.Workflow()
                    .each(resources, function (r, cb) { return folder_2.addChild(r, cb); })
                    .error(function (e) { return callback(e, null); })
                    .done(function () { return callback(null, folder_2); });
            }
            else
                callback(e, null);
        });
    };
    return PhysicalFolder;
}(PhysicalResource_1.PhysicalResource));
exports.PhysicalFolder = PhysicalFolder;
