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
var Errors_1 = require("../../../Errors");
var stream_1 = require("stream");
var Client = require("ftp");
var _FTPFileSystemResource = (function () {
    function _FTPFileSystemResource(data) {
        if (!data) {
            this.props = new export_1.LocalPropertyManager();
            this.locks = new export_1.LocalLockManager();
        }
        else {
            var rs = data;
            this.props = rs.props;
            this.locks = rs.locks;
        }
    }
    return _FTPFileSystemResource;
}());
exports._FTPFileSystemResource = _FTPFileSystemResource;
var FTPSerializer = (function () {
    function FTPSerializer() {
    }
    FTPSerializer.prototype.uid = function () {
        return 'FTPFSSerializer_1.0.0';
    };
    FTPSerializer.prototype.serialize = function (fs, callback) {
        callback(null, {
            resources: fs.resources,
            config: fs.config
        });
    };
    FTPSerializer.prototype.unserialize = function (serializedData, callback) {
        var fs = new FTPFileSystem(serializedData.config);
        fs.resources = serializedData.resources;
        callback(null, fs);
    };
    return FTPSerializer;
}());
exports.FTPSerializer = FTPSerializer;
var FTPFileSystem = (function (_super) {
    __extends(FTPFileSystem, _super);
    function FTPFileSystem(config) {
        var _this = _super.call(this, new FTPSerializer()) || this;
        _this.config = config;
        _this.resources = {
            '/': new _FTPFileSystemResource()
        };
        return _this;
    }
    FTPFileSystem.prototype.getRealPath = function (path) {
        var sPath = path.toString();
        return {
            realPath: sPath,
            resource: this.resources[sPath]
        };
    };
    FTPFileSystem.prototype.connect = function (callback) {
        var client = new Client();
        client.on('ready', function () { return callback(client); });
        client.connect(this.config);
    };
    FTPFileSystem.prototype._create = function (path, ctx, _callback) {
        var _this = this;
        if (path.isRoot())
            return _callback(Errors_1.Errors.InvalidOperation);
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            var callback = function (e) {
                if (!e)
                    _this.resources[path.toString()] = new _FTPFileSystemResource();
                else if (e)
                    e = Errors_1.Errors.ResourceAlreadyExists;
                c.end();
                _callback(e);
            };
            if (ctx.type.isDirectory)
                c.mkdir(realPath, callback);
            else {
                _this._openWriteStream(path, {
                    context: ctx.context,
                    estimatedSize: 0,
                    mode: null,
                    targetSource: true
                }, function (e, wStream) {
                    if (e)
                        return callback(e);
                    wStream.end(new Buffer(0), callback);
                });
            }
        });
    };
    FTPFileSystem.prototype._delete = function (path, ctx, _callback) {
        var _this = this;
        if (path.isRoot())
            return _callback(Errors_1.Errors.InvalidOperation);
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            var callback = function (e) {
                if (!e)
                    delete _this.resources[path.toString()];
                c.end();
                _callback(e);
            };
            _this.type(ctx.context, path, function (e, type) {
                if (e)
                    return callback(Errors_1.Errors.ResourceNotFound);
                if (type.isDirectory)
                    c.rmdir(realPath, callback);
                else
                    c.delete(realPath, callback);
            });
        });
    };
    FTPFileSystem.prototype._openWriteStream = function (path, ctx, callback) {
        if (path.isRoot())
            return callback(Errors_1.Errors.InvalidOperation);
        var _a = this.getRealPath(path), realPath = _a.realPath, resource = _a.resource;
        this.connect(function (c) {
            var wStream = new stream_1.Transform({
                transform: function (chunk, encoding, cb) {
                    cb(null, chunk);
                }
            });
            c.put(wStream, realPath, function (e) {
                c.end();
            });
            callback(null, wStream);
        });
    };
    FTPFileSystem.prototype._openReadStream = function (path, ctx, callback) {
        if (path.isRoot())
            return callback(Errors_1.Errors.InvalidOperation);
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            c.get(realPath, function (e, rStream) {
                if (e)
                    return callback(Errors_1.Errors.ResourceNotFound, null);
                var stream = new stream_1.Transform({
                    transform: function (chunk, encoding, cb) {
                        cb(null, chunk);
                    }
                });
                stream.on('error', function () {
                    c.end();
                });
                stream.on('finish', function () {
                    c.end();
                });
                rStream.pipe(stream);
                callback(null, stream);
            });
        });
    };
    FTPFileSystem.prototype._move = function (pathFrom, pathTo, ctx, callback) {
        var _this = this;
        if (pathFrom.isRoot())
            return callback(Errors_1.Errors.InvalidOperation);
        if (pathTo.isRoot())
            return callback(Errors_1.Errors.InvalidOperation);
        var realPathFrom = this.getRealPath(pathFrom).realPath;
        var realPathTo = this.getRealPath(pathTo).realPath;
        this.connect(function (c) {
            c.rename(realPathFrom, realPathTo, function (e) {
                if (!e) {
                    _this.resources[realPathTo] = _this.resources[realPathFrom];
                    delete _this.resources[realPathFrom];
                    c.end();
                    callback(null, true);
                }
                else {
                    c.lastMod(realPathTo, function (er) {
                        if (!er)
                            e = Errors_1.Errors.ResourceAlreadyExists;
                        else
                            e = Errors_1.Errors.ResourceNotFound;
                        c.end();
                        callback(e, false);
                    });
                }
            });
        });
    };
    FTPFileSystem.prototype._size = function (path, ctx, callback) {
        if (path.isRoot())
            return callback(Errors_1.Errors.InvalidOperation);
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            c.size(realPath, function (e, size) {
                c.end();
                callback(e ? Errors_1.Errors.ResourceNotFound : null, size);
            });
        });
    };
    FTPFileSystem.prototype._lockManager = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (!resource) {
            resource = new _FTPFileSystemResource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource.locks);
    };
    FTPFileSystem.prototype._propertyManager = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (!resource) {
            resource = new _FTPFileSystemResource();
            this.resources[path.toString()] = resource;
        }
        callback(null, resource.props);
    };
    FTPFileSystem.prototype._readDir = function (path, ctx, callback) {
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            c.list(realPath, function (e, list) {
                c.end();
                if (e)
                    return callback(Errors_1.Errors.ResourceNotFound);
                callback(null, list.map(function (el) { return el.name; }));
            });
        });
    };
    FTPFileSystem.prototype._creationDate = function (path, ctx, callback) {
        this._lastModifiedDate(path, {
            context: ctx.context
        }, callback);
    };
    FTPFileSystem.prototype._lastModifiedDate = function (path, ctx, callback) {
        if (path.isRoot())
            return callback(null, 0);
        var realPath = this.getRealPath(path).realPath;
        this.connect(function (c) {
            c.lastMod(realPath, function (e, date) {
                c.end();
                callback(e ? Errors_1.Errors.ResourceNotFound : null, !date ? 0 : date.valueOf());
            });
        });
    };
    FTPFileSystem.prototype._type = function (path, ctx, callback) {
        if (path.isRoot())
            return callback(null, export_1.ResourceType.Directory);
        var realPath = this.getRealPath(path.getParent()).realPath;
        this.connect(function (c) {
            c.list(realPath, function (e, list) {
                c.end();
                if (e)
                    return callback(Errors_1.Errors.ResourceNotFound);
                for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                    var element = list_1[_i];
                    if (element.name === path.fileName())
                        return callback(null, element.type === '-' ? export_1.ResourceType.File : export_1.ResourceType.Directory);
                }
                callback(Errors_1.Errors.ResourceNotFound);
            });
        });
    };
    return FTPFileSystem;
}(export_1.FileSystem));
exports.FTPFileSystem = FTPFileSystem;
