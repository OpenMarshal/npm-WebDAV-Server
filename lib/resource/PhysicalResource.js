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
var Resource_1 = require("./Resource");
var ResourceChildren_1 = require("./ResourceChildren");
var mimeTypes = require("mime-types");
var path = require("path");
var fs = require("fs");
var PhysicalResource = (function (_super) {
    __extends(PhysicalResource, _super);
    function PhysicalResource(realPath, parent, fsManager) {
        var _this = _super.call(this, parent, fsManager) || this;
        _this.realPath = path.resolve(realPath);
        return _this;
    }
    PhysicalResource.prototype.moveTo = function (to, callback) {
        callback(new Error('Not implemented yet.'), null, null);
    };
    PhysicalResource.prototype.rename = function (newName, callback) {
        var _this = this;
        var newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, function (e) {
            if (e) {
                callback(e, null, null);
                return;
            }
            var oldName = path.basename(_this.realPath);
            _this.realPath = newPath;
            _this.updateLastModified();
            callback(e, oldName, newName);
        });
    };
    PhysicalResource.prototype.webName = function (callback) {
        callback(null, path.basename(this.realPath));
    };
    return PhysicalResource;
}(Resource_1.StandardResource));
exports.PhysicalResource = PhysicalResource;
var PhysicalFolder = (function (_super) {
    __extends(PhysicalFolder, _super);
    function PhysicalFolder(realPath, parent, fsManager) {
        var _this = _super.call(this, realPath, parent, fsManager) || this;
        _this.children = new ResourceChildren_1.ResourceChildren();
        return _this;
    }
    PhysicalFolder.prototype.type = function (callback) {
        callback(null, Resource_1.ResourceType.Directory);
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
            ResourceChildren_1.forAll(children, function (child, cb) {
                child.delete(cb);
            }, function () {
                fs.unlink(_this.realPath, function (e) {
                    if (e)
                        callback(e);
                    else
                        _this.removeFromParent(callback);
                });
            }, callback);
        });
    };
    PhysicalFolder.prototype.append = function (data, callback) {
        callback(new Error('Invalid operation'));
    };
    PhysicalFolder.prototype.write = function (data, callback) {
        callback(new Error('Invalid operation'));
    };
    PhysicalFolder.prototype.read = function (callback) {
        callback(new Error('Invalid operation'), null);
    };
    PhysicalFolder.prototype.mimeType = function (callback) {
        callback(null, 'directory');
    };
    PhysicalFolder.prototype.size = function (callback) {
        Resource_1.StandardResource.sizeOfSubFiles(this, callback);
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
        this.children.remove(resource, callback);
    };
    PhysicalFolder.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return PhysicalFolder;
}(PhysicalResource));
exports.PhysicalFolder = PhysicalFolder;
var PhysicalFile = (function (_super) {
    __extends(PhysicalFile, _super);
    function PhysicalFile(realPath, parent, fsManager) {
        return _super.call(this, realPath, parent, fsManager) || this;
    }
    PhysicalFile.prototype.type = function (callback) {
        callback(null, Resource_1.ResourceType.File);
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
}(PhysicalResource));
exports.PhysicalFile = PhysicalFile;
