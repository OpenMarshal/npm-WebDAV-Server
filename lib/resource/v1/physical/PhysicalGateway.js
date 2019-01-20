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
var PhysicalGFSManager_1 = require("../../../manager/v1/PhysicalGFSManager");
var PhysicalResource_1 = require("./PhysicalResource");
var PhysicalFolder_1 = require("./PhysicalFolder");
var PhysicalFile_1 = require("./PhysicalFile");
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var path = require("path");
var fs = require("fs");
var PhysicalGateway = /** @class */ (function (_super) {
    __extends(PhysicalGateway, _super);
    function PhysicalGateway(rootPath, customName, parent, fsManager) {
        var _this = _super.call(this, rootPath, parent, fsManager ? fsManager : new PhysicalGFSManager_1.PhysicalGFSManager()) || this;
        _this.customName = customName;
        _this.cache = {
            '/': _this
        };
        return _this;
    }
    PhysicalGateway.prototype.webName = function (callback) {
        if (this.customName)
            callback(null, this.customName);
        else
            _super.prototype.webName.call(this, callback);
    };
    PhysicalGateway.prototype.listChildren = function (parent, rpath, callback) {
        var _this = this;
        if (rpath.lastIndexOf('/') !== rpath.length - 1)
            rpath += '/';
        fs.readdir(parent.realPath, function (e, list) {
            if (e) {
                callback(e);
                return;
            }
            new Workflow_1.Workflow()
                .each(list, function (file, cb) {
                var resourcePath = rpath + file;
                var resource = _this.cache[resourcePath];
                var realPath = path.join(parent.realPath, file);
                if (resource) {
                    cb(null, resource);
                    return;
                }
                fs.stat(realPath, function (e, stat) {
                    if (e) {
                        cb(e);
                        return;
                    }
                    if (stat.isFile())
                        resource = new PhysicalFile_1.PhysicalFile(realPath, parent, _this.fsManager);
                    else
                        resource = new PhysicalFolder_1.PhysicalFolder(realPath, parent, _this.fsManager);
                    resource.deleteOnMoved = true;
                    _this.cache[resourcePath] = resource;
                    cb(null, resource);
                });
            })
                .error(callback)
                .done(function (resources) { return callback(null, resources); });
        });
    };
    PhysicalGateway.prototype.find = function (path, callback, forceRefresh) {
        var _this = this;
        if (forceRefresh === void 0) { forceRefresh = false; }
        var resource = this.cache[path.toString()];
        if (forceRefresh || !resource) {
            var parentPath_1 = path.getParent();
            this.find(parentPath_1, function (e, parent) {
                if (e) {
                    callback(e);
                    return;
                }
                parent.getChildren(function (e, actualChildren) {
                    if (e) {
                        callback(e);
                        return;
                    }
                    _this.listChildren(parent, parentPath_1.toString(), function (e, children) {
                        if (e) {
                            callback(e);
                            return;
                        }
                        actualChildren
                            .filter(function (c) { return c.constructor !== PhysicalResource_1.PhysicalResource && c.constructor !== PhysicalFile_1.PhysicalFile && c.constructor !== PhysicalFolder_1.PhysicalFolder; })
                            .forEach(function (c) { return children.push(c); });
                        parent.children.children = children;
                        new Workflow_1.Workflow()
                            .each(children, function (child, cb) {
                            child.webName(function (e, name) {
                                cb(e, !e && name === path.fileName() ? child : null);
                            });
                        })
                            .error(callback)
                            .done(function (matchingChildren) {
                            for (var _i = 0, matchingChildren_1 = matchingChildren; _i < matchingChildren_1.length; _i++) {
                                var child = matchingChildren_1[_i];
                                if (child) {
                                    callback(null, child);
                                    return;
                                }
                            }
                            callback(Errors_1.Errors.ResourceNotFound);
                        });
                    });
                });
            });
        }
        else
            callback(null, resource);
    };
    PhysicalGateway.prototype.gateway = function (arg, path, callback) {
        var _this = this;
        var updateChildren = function (r, cb) {
            _this.listChildren(r, path.toString(), function (e, children) {
                if (!e) {
                    r.children.children
                        .filter(function (c) { return c.constructor !== PhysicalResource_1.PhysicalResource && c.constructor !== PhysicalFile_1.PhysicalFile && c.constructor !== PhysicalFolder_1.PhysicalFolder; })
                        .forEach(function (c) { return children.push(c); });
                    r.children.children = children;
                }
                cb(e);
            });
        };
        if (path.isRoot()) {
            updateChildren(this, function (e) {
                callback(e, _this);
            });
            return;
        }
        this.find(path, function (e, r) {
            if (e) {
                callback(e);
                return;
            }
            r.type(function (e, type) {
                if (e) {
                    callback(e);
                    return;
                }
                if (type.isFile) {
                    callback(e, r);
                    return;
                }
                updateChildren(r, function (e) {
                    callback(e, r);
                });
            });
        });
    };
    return PhysicalGateway;
}(PhysicalFolder_1.PhysicalFolder));
exports.PhysicalGateway = PhysicalGateway;
