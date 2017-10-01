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
var export_1 = require("../fileSystem/export");
var path_1 = require("path");
var Errors_1 = require("../../../Errors");
var fs = require("fs");
var PhysicalFileSystemResource = (function () {
    function PhysicalFileSystemResource(data) {
        if (!data) {
            this.props = new export_1.LocalPropertyManager();
            this.locks = new export_1.LocalLockManager();
        }
        else {
            var rs = data;
            this.props = new export_1.LocalPropertyManager(rs.props);
            this.locks = new export_1.LocalLockManager();
        }
    }
    return PhysicalFileSystemResource;
}());
exports.PhysicalFileSystemResource = PhysicalFileSystemResource;
var PhysicalSerializer = (function () {
    function PhysicalSerializer() {
    }
    PhysicalSerializer.prototype.uid = function () {
        return 'PhysicalFSSerializer-1.0.0';
    };
    PhysicalSerializer.prototype.serialize = function (fs, callback) {
        callback(null, {
            resources: fs.resources,
            rootPath: fs.rootPath
        });
    };
    PhysicalSerializer.prototype.unserialize = function (serializedData, callback) {
        var fs = new PhysicalFileSystem(serializedData.rootPath);
        fs.resources = serializedData.resources;
        callback(null, fs);
    };
    return PhysicalSerializer;
}());
exports.PhysicalSerializer = PhysicalSerializer;
exports.PhysicalSerializerVersions = {
    versions: {
        '1.0.0': PhysicalSerializer,
    },
    instances: [
        new PhysicalSerializer()
    ]
};
var PhysicalFileSystem = (function (_super) {
    __extends(PhysicalFileSystem, _super);
    function PhysicalFileSystem(rootPath) {
        var _this = _super.call(this, new PhysicalSerializer()) || this;
        _this.rootPath = rootPath;
        _this.resources = {
            '/': new PhysicalFileSystemResource()
        };
        return _this;
    }
    PhysicalFileSystem.prototype.getRealPath = function (path) {
        var sPath = path.toString();
        return {
            realPath: path_1.join(this.rootPath, sPath.substr(1)),
            resource: this.resources[sPath]
        };
    };
    PhysicalFileSystem.prototype._create = function (path, ctx, _callback) {
        var _this = this;
        var realPath = this.getRealPath(path).realPath;
        var callback = function (e) {
            if (!e)
                _this.resources[path.toString()] = new PhysicalFileSystemResource();
            else if (e)
                e = Errors_1.Errors.ResourceAlreadyExists;
            _callback(e);
        };
        if (ctx.type.isDirectory)
            fs.mkdir(realPath, callback);
        else {
            if (!fs.constants || !fs.constants.O_CREAT) {
                fs.writeFile(realPath, new Buffer(0), callback);
            }
            else {
                fs.open(realPath, fs.constants.O_CREAT, function (e, fd) {
                    if (e)
                        return callback(e);
                    fs.close(fd, callback);
                });
            }
        }
    };
    PhysicalFileSystem.prototype._delete = function (path, ctx, _callback) {
        var _this = this;
        var realPath = this.getRealPath(path).realPath;
        var callback = function (e) {
            if (!e)
                delete _this.resources[path.toString()];
            _callback(e);
        };
        this.type(ctx.context, path, function (e, type) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            if (type.isDirectory) {
                if (ctx.depth === 0)
                    return fs.rmdir(realPath, callback);
                _this.readDir(ctx.context, path, function (e, files) {
                    var nb = files.length + 1;
                    var done = function (e) {
                        if (nb < 0)
                            return;
                        if (e) {
                            nb = -1;
                            return callback(e);
                        }
                        if (--nb === 0)
                            fs.rmdir(realPath, callback);
                    };
                    files.forEach(function (file) { return _this.delete(ctx.context, path.getChildPath(file), ctx.depth === -1 ? -1 : ctx.depth - 1, function (e) { return done(e); }); });
                    done();
                });
            }
            else
                fs.unlink(realPath, callback);
        });
    };
    PhysicalFileSystem.prototype._openWriteStream = function (path, ctx, callback) {
        var _this = this;
        var _a = this.getRealPath(path), realPath = _a.realPath, resource = _a.resource;
        fs.open(realPath, 'w+', function (e, fd) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            if (!resource)
                _this.resources[path.toString()] = new PhysicalFileSystemResource();
            callback(null, fs.createWriteStream(null, { fd: fd }));
        });
    };
    PhysicalFileSystem.prototype._openReadStream = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        fs.open(realPath, 'r', function (e, fd) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            callback(null, fs.createReadStream(null, { fd: fd }));
        });
    };
    PhysicalFileSystem.prototype._move = function (pathFrom, pathTo, ctx, callback) {
        var _this = this;
        var realPathFrom = this.getRealPath(pathFrom).realPath;
        var realPathTo = this.getRealPath(pathTo).realPath;
        var rename = function (overwritten) {
            fs.rename(realPathFrom, realPathTo, function (e) {
                if (e)
                    return callback(e);
                _this.resources[realPathTo] = _this.resources[realPathFrom];
                delete _this.resources[realPathFrom];
                callback(null, overwritten);
            });
        };
        fs.access(realPathTo, function (e) {
            if (e) {
                rename(false);
            }
            else {
                if (!ctx.overwrite)
                    return callback(Errors_1.Errors.ResourceAlreadyExists);
                _this.delete(ctx.context, pathTo, function (e) {
                    if (e)
                        return callback(e);
                    rename(true);
                });
            }
        });
        /*
        
        fs.rename(realPathFrom, realPathTo, (e) => {
            if(!e)
            {
                this.resources[realPathTo] = this.resources[realPathFrom];
                delete this.resources[realPathFrom];
                callback(null, true);
            }
            else
            {
                fs.stat(realPathTo, (er) => {
                    if(!er)
                        e = Errors.ResourceAlreadyExists;
                    else
                        e = Errors.ResourceNotFound;
                    callback(e, false);
                })
            }
        })*/
    };
    PhysicalFileSystem.prototype._size = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        fs.stat(realPath, function (e, stat) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            callback(null, stat.size);
        });
    };
    PhysicalFileSystem.prototype._lockManager = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (!resource) {
            resource = new PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource.locks);
    };
    PhysicalFileSystem.prototype._propertyManager = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (!resource) {
            resource = new PhysicalFileSystemResource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource.props);
    };
    PhysicalFileSystem.prototype._readDir = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        fs.readdir(realPath, function (e, files) {
            callback(e ? Errors_1.Errors.ResourceNotFound : null, files);
        });
    };
    PhysicalFileSystem.prototype._creationDate = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        fs.stat(realPath, function (e, stat) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            callback(null, stat.birthtime.valueOf());
        });
    };
    PhysicalFileSystem.prototype._lastModifiedDate = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        fs.stat(realPath, function (e, stat) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            callback(null, stat.mtime.valueOf());
        });
    };
    PhysicalFileSystem.prototype._type = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        if (realPath.indexOf('.url') !== -1)
            return callback(Errors_1.Errors.ResourceNotFound);
        fs.stat(realPath, function (e, stat) {
            if (e)
                return callback(Errors_1.Errors.ResourceNotFound);
            callback(null, stat.isDirectory() ? export_1.ResourceType.Directory : export_1.ResourceType.File);
        });
    };
    return PhysicalFileSystem;
}(export_1.FileSystem));
exports.PhysicalFileSystem = PhysicalFileSystem;
