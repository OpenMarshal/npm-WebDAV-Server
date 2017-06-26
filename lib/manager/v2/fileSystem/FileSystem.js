"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("../../../resource/lock/LockScope");
var LockType_1 = require("../../../resource/lock/LockType");
var LockKind_1 = require("../../../resource/lock/LockKind");
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var Path_1 = require("../Path");
var CommonTypes_1 = require("./CommonTypes");
var ContextualFileSystem_1 = require("./ContextualFileSystem");
var Resource_1 = require("./Resource");
var StandardMethods_1 = require("./StandardMethods");
var crypto = require("crypto");
var FileSystem = (function () {
    function FileSystem(serializer) {
        this.__serializer = serializer;
    }
    FileSystem.prototype.serializer = function () {
        return this.__serializer;
    };
    FileSystem.prototype.contextualize = function (ctx) {
        return new ContextualFileSystem_1.ContextualFileSystem(this, ctx);
    };
    FileSystem.prototype.resource = function (ctx, path) {
        return new Resource_1.Resource(path, this, ctx);
    };
    FileSystem.prototype.fastExistCheckEx = function (ctx, path, errorCallback, callback) {
        if (!this._fastExistCheck)
            return callback();
        this._fastExistCheck(ctx, path, function (exists) {
            if (!exists)
                errorCallback(Errors_1.Errors.ResourceNotFound);
            else
                callback();
        });
    };
    FileSystem.prototype.fastExistCheckExReverse = function (ctx, path, errorCallback, callback) {
        if (!this._fastExistCheck)
            return callback();
        this._fastExistCheck(ctx, path, function (exists) {
            if (exists)
                errorCallback(Errors_1.Errors.ResourceAlreadyExists);
            else
                callback();
        });
    };
    FileSystem.prototype.fastExistCheck = function (ctx, path, callback) {
        if (!this._fastExistCheck)
            return callback(true);
        this._fastExistCheck(ctx, path, function (exists) { return callback(!!exists); });
    };
    FileSystem.prototype.create = function (ctx, path, type, _createIntermediates, _callback) {
        var _this = this;
        var createIntermediates = _callback ? _createIntermediates : false;
        var callback = _callback ? _callback : _createIntermediates;
        if (!this._create)
            return callback(Errors_1.Errors.InvalidOperation);
        var go = function () {
            _this._create(path, {
                context: ctx,
                type: type
            }, callback);
        };
        this.fastExistCheckExReverse(ctx, path, callback, function () {
            _this.type(ctx, path.getParent(), function (e, type) {
                if (e === Errors_1.Errors.ResourceNotFound) {
                    if (!createIntermediates)
                        return callback(Errors_1.Errors.IntermediateResourceMissing);
                    _this.getFullPath(ctx, path, function (e, fullPath) {
                        if (e)
                            return callback(e);
                        fullPath = fullPath.getParent();
                        ctx.getResource(fullPath, function (e, r) {
                            if (e)
                                return callback(e);
                            r.create(CommonTypes_1.ResourceType.Directory, function (e) {
                                if (e && e !== Errors_1.Errors.ResourceAlreadyExists)
                                    return callback(e);
                                go();
                            });
                        });
                    });
                    return;
                }
                if (e)
                    return callback(e);
                if (!type.isDirectory)
                    return callback(Errors_1.Errors.WrongParentTypeForCreation);
                go();
            });
        });
    };
    FileSystem.prototype.etag = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._etag)
                return _this.lastModifiedDate(ctx, path, function (e, date) {
                    if (e)
                        return callback(e);
                    callback(null, '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"');
                });
            _this._etag(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.delete = function (ctx, path, _depth, _callback) {
        var _this = this;
        var depth = _callback ? _depth : -1;
        var callback = _callback ? _callback : _depth;
        if (!this._delete)
            return callback(Errors_1.Errors.InvalidOperation);
        this.fastExistCheckEx(ctx, path, callback, function () {
            _this._delete(path, {
                context: ctx,
                depth: depth
            }, callback);
        });
    };
    FileSystem.prototype.openWriteStream = function (ctx, path, _mode, _targetSource, _estimatedSize, _callback) {
        var _this = this;
        var targetSource = true;
        for (var _i = 0, _a = [_mode, _targetSource]; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj && obj.constructor === Boolean)
                targetSource = obj;
        }
        var estimatedSize = -1;
        for (var _b = 0, _c = [_mode, _targetSource, _estimatedSize]; _b < _c.length; _b++) {
            var obj = _c[_b];
            if (obj && obj.constructor === Number)
                estimatedSize = obj;
        }
        var callback;
        for (var _d = 0, _e = [_mode, _targetSource, _estimatedSize, _callback]; _d < _e.length; _d++) {
            var obj = _e[_d];
            if (obj && obj.constructor === Function)
                callback = obj;
        }
        var mode = _mode && _mode.constructor === String ? _mode : 'mustExist';
        var created = false;
        if (!this._openWriteStream)
            return callback(Errors_1.Errors.InvalidOperation);
        var go = function (callback) {
            _this._openWriteStream(path, {
                context: ctx,
                estimatedSize: estimatedSize,
                targetSource: targetSource,
                mode: mode
            }, function (e, wStream) { return callback(e, wStream, created); });
        };
        var createAndGo = function (intermediates) {
            _this.create(ctx, path, CommonTypes_1.ResourceType.File, intermediates, function (e) {
                if (e)
                    return callback(e);
                created = true;
                go(callback);
            });
        };
        switch (mode) {
            case 'mustExist':
                this.fastExistCheckEx(ctx, path, callback, function () { return go(callback); });
                break;
            case 'mustCreateIntermediates':
            case 'mustCreate':
                createAndGo(mode === 'mustCreateIntermediates');
                break;
            case 'canCreateIntermediates':
            case 'canCreate':
                go(function (e, wStream) {
                    if (e === Errors_1.Errors.ResourceNotFound)
                        createAndGo(mode === 'canCreateIntermediates');
                    else
                        callback(e, wStream);
                });
                break;
            default:
                callback(Errors_1.Errors.IllegalArguments);
                break;
        }
    };
    FileSystem.prototype.openReadStream = function (ctx, path, _targetSource, _estimatedSize, _callback) {
        var _this = this;
        var targetSource = _targetSource.constructor === Boolean ? _targetSource : true;
        var estimatedSize = _callback ? _estimatedSize : _estimatedSize ? _targetSource : -1;
        var callback = _callback ? _callback : _estimatedSize ? _estimatedSize : _targetSource;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._openReadStream)
                return callback(Errors_1.Errors.InvalidOperation);
            _this._openReadStream(path, {
                context: ctx,
                estimatedSize: estimatedSize,
                targetSource: targetSource
            }, callback);
        });
    };
    FileSystem.prototype.move = function (ctx, pathFrom, pathTo, _overwrite, _callback) {
        var _this = this;
        var callback = _callback ? _callback : _overwrite;
        var overwrite = _callback ? _overwrite : false;
        var go = function () {
            if (_this._move) {
                _this._move(pathFrom, pathTo, {
                    context: ctx,
                    overwrite: overwrite
                }, callback);
                return;
            }
            StandardMethods_1.StandardMethods.standardMove(ctx, pathFrom, _this, pathTo, _this, callback);
        };
        this.fastExistCheckEx(ctx, pathFrom, callback, function () {
            if (!overwrite)
                _this.fastExistCheckExReverse(ctx, pathTo, callback, go);
            else
                go();
        });
    };
    FileSystem.prototype.copy = function (ctx, pathFrom, pathTo, _overwrite, _depth, _callback) {
        var _this = this;
        var overwrite = _overwrite.constructor === Boolean ? _overwrite : false;
        var depth = _callback ? _depth : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite : -1;
        var callback = _callback ? _callback : _depth ? _depth : _overwrite;
        if (this._copy) {
            var go_1 = function () {
                _this._copy(pathFrom, pathTo, {
                    context: ctx,
                    depth: depth,
                    overwrite: overwrite
                }, callback);
            };
            this.fastExistCheckEx(ctx, pathFrom, callback, function () {
                if (!overwrite)
                    _this.fastExistCheckExReverse(ctx, pathTo, callback, go_1);
                else
                    go_1();
            });
        }
        else
            StandardMethods_1.StandardMethods.standardCopy(ctx, pathFrom, this, pathTo, this, overwrite, depth, callback);
    };
    FileSystem.prototype.rename = function (ctx, pathFrom, newName, _overwrite, _callback) {
        var _this = this;
        var overwrite = _callback ? _overwrite : false;
        var callback = _callback ? _callback : _overwrite;
        if (pathFrom.isRoot()) {
            this.getFullPath(ctx, function (e, fullPath) {
                if (fullPath.isRoot())
                    return callback(Errors_1.Errors.InvalidOperation);
                var newPath = fullPath.getParent().getChildPath(newName);
                ctx.server.getFileSystem(newPath, function (fs, _, subPath) {
                    var go = function (overwritten) {
                        ctx.server.setFileSystem(newPath, _this, function (successed) {
                            if (!successed)
                                return callback(Errors_1.Errors.InvalidOperation);
                            ctx.server.removeFileSystem(fullPath, function () { return callback(null, overwritten); });
                        });
                    };
                    if (!subPath.isRoot())
                        return go(false);
                    if (!overwrite)
                        return callback(Errors_1.Errors.ResourceAlreadyExists);
                    ctx.server.removeFileSystem(newPath, function () {
                        go(true);
                    });
                });
            });
            return;
        }
        this.fastExistCheckEx(ctx, pathFrom, callback, function () {
            _this.fastExistCheckExReverse(ctx, pathFrom.getParent().getChildPath(newName), callback, function () {
                if (_this._rename) {
                    _this._rename(pathFrom, newName, {
                        context: ctx
                    }, callback);
                    return;
                }
                _this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
            });
        });
    };
    FileSystem.prototype.mimeType = function (ctx, path, _targetSource, _callback) {
        var _this = this;
        var targetSource = _callback ? _targetSource : true;
        var callback = _callback ? _callback : _targetSource;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (_this._mimeType) {
                _this._mimeType(path, {
                    context: ctx,
                    targetSource: targetSource
                }, callback);
                return;
            }
            StandardMethods_1.StandardMethods.standardMimeType(ctx, _this, path, targetSource, callback);
        });
    };
    FileSystem.prototype.size = function (ctx, path, _targetSource, _callback) {
        var _this = this;
        var targetSource = _callback ? _targetSource : true;
        var callback = _callback ? _callback : _targetSource;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._size)
                return callback(null, 0);
            _this._size(path, {
                context: ctx,
                targetSource: targetSource
            }, callback);
        });
    };
    FileSystem.prototype.availableLocks = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._availableLocks)
                return callback(null, [
                    new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write),
                    new LockKind_1.LockKind(LockScope_1.LockScope.Shared, LockType_1.LockType.Write)
                ]);
            _this._availableLocks(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.lockManager = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            _this._lockManager(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.propertyManager = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            _this._propertyManager(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.readDir = function (ctx, path, _retrieveExternalFiles, _callback) {
        var _this = this;
        var retrieveExternalFiles = _callback ? _retrieveExternalFiles : false;
        var callback = _callback ? _callback : _retrieveExternalFiles;
        this.fastExistCheckEx(ctx, path, callback, function () {
            var next = function (base) {
                if (!_this._readDir)
                    return callback(null, base);
                _this._readDir(path, {
                    context: ctx
                }, function (e, paths) {
                    if (e)
                        return callback(e);
                    if (paths.length === 0)
                        return callback(null, base);
                    if (paths[0].constructor === String)
                        base = base.concat(paths);
                    else
                        base = base.concat(paths.map(function (p) { return p.fileName(); }));
                    callback(null, base);
                });
            };
            if (!retrieveExternalFiles)
                return next([]);
            _this.getFullPath(ctx, function (e, thisFullPath) {
                if (e)
                    return callback(e);
                ctx.server.getChildFileSystems(thisFullPath.getChildPath(path), function (fss) {
                    next(fss.map(function (f) { return f.path.fileName(); }));
                });
            });
        });
    };
    FileSystem.prototype.creationDate = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._creationDate && !_this._lastModifiedDate)
                return callback(null, 0);
            if (!_this._creationDate)
                return _this.lastModifiedDate(ctx, path, callback);
            _this._creationDate(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.lastModifiedDate = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._creationDate && !_this._lastModifiedDate)
                return callback(null, 0);
            if (!_this._lastModifiedDate)
                return _this.creationDate(ctx, path, callback);
            _this._lastModifiedDate(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.webName = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (path.isRoot())
                _this.getFullPath(ctx, function (e, path) { return callback(e, e ? null : path.fileName()); });
            else
                callback(null, path.fileName());
        });
    };
    FileSystem.prototype.displayName = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            if (!_this._displayName)
                return _this.webName(ctx, path, callback);
            _this._displayName(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.type = function (ctx, path, callback) {
        var _this = this;
        this.fastExistCheckEx(ctx, path, callback, function () {
            _this._type(path, {
                context: ctx
            }, callback);
        });
    };
    FileSystem.prototype.addSubTree = function (ctx, _rootPath, _tree, _callback) {
        var _this = this;
        var callback = _callback ? _callback : _tree;
        var tree = _callback ? _tree : _rootPath;
        var rootPath = _callback ? _rootPath : new Path_1.Path('/');
        if (tree.constructor === CommonTypes_1.ResourceType) {
            this.create(ctx, rootPath, tree, callback);
        }
        else {
            new Workflow_1.Workflow()
                .each(Object.keys(tree), function (name, cb) {
                var value = tree[name];
                if (value.constructor === CommonTypes_1.ResourceType)
                    _this.addSubTree(ctx, rootPath.getChildPath(name), value, cb);
                else
                    _this.addSubTree(ctx, rootPath.getChildPath(name), CommonTypes_1.ResourceType.Directory, function (e) {
                        if (e)
                            return cb(e);
                        _this.addSubTree(ctx, rootPath.getChildPath(name), value, cb);
                    });
            })
                .error(callback)
                .done(function () { return callback(); });
        }
    };
    FileSystem.prototype.listDeepLocks = function (ctx, startPath, _depth, _callback) {
        var _this = this;
        var depth = _callback ? _depth : 0;
        var callback = _callback ? _callback : _depth;
        this.lockManager(ctx, startPath, function (e, lm) {
            if (e)
                return callback(e);
            lm.getLocks(function (e, locks) {
                if (e)
                    return callback(e);
                if (depth != -1)
                    locks = locks.filter(function (f) { return f.depth === -1 || f.depth >= depth; });
                var go = function (fs, parentPath) {
                    var destDepth = depth === -1 ? -1 : depth + 1;
                    fs.listDeepLocks(ctx, parentPath, destDepth, function (e, pLocks) {
                        if (e)
                            return callback(e);
                        if (locks && locks.length > 0)
                            pLocks[startPath.toString()] = locks;
                        callback(null, pLocks);
                    });
                };
                if (!startPath.isRoot())
                    return go(_this, startPath.getParent());
                _this.getFullPath(ctx, function (e, fsPath) {
                    if (e)
                        return callback(e);
                    if (fsPath.isRoot()) {
                        var result = {};
                        if (locks && locks.length > 0)
                            result[startPath.toString()] = locks;
                        return callback(null, result);
                    }
                    ctx.server.getFileSystem(fsPath.getParent(), function (fs, _, subPath) {
                        go(fs, subPath);
                    });
                });
            });
        });
    };
    FileSystem.prototype.getFullPath = function (ctx, _path, _callback) {
        var path = _callback ? _path : undefined;
        var callback = _callback ? _callback : _path;
        ctx.server.getFileSystemPath(this, function (fsPath) {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        });
    };
    FileSystem.prototype.checkPrivilege = function (ctx, path, privileges, callback) {
        if (privileges.constructor === String)
            privileges = [privileges];
        var resource = this.resource(ctx, path);
        new Workflow_1.Workflow()
            .each(privileges, function (privilege, cb) {
            if (!privilege)
                return cb(null, true);
            var method = ctx.server.options.privilegeManager[privilege];
            if (!method)
                return cb(null, true);
            method(ctx, resource, cb);
        })
            .error(function (e) { return callback(e, false); })
            .done(function (successes) { return callback(null, successes.every(function (s) { return !!s; })); });
    };
    FileSystem.prototype.serialize = function (callback) {
        this.serializer().serialize(this, callback);
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
