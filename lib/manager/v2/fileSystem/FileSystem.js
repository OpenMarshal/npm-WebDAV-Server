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
var BufferedIsLocked = (function () {
    function BufferedIsLocked(fs, ctx, path) {
        this.fs = fs;
        this.ctx = ctx;
        this.path = path;
        this._isLocked = null;
    }
    BufferedIsLocked.prototype.isLocked = function (callback) {
        var _this = this;
        if (this._isLocked !== null)
            return callback(null, this._isLocked);
        this.fs.isLocked(this.ctx, this.path, function (e, locked) {
            if (e)
                return callback(e);
            _this._isLocked = locked;
            callback(null, locked);
        });
    };
    return BufferedIsLocked;
}());
var FileSystem = (function () {
    function FileSystem(serializer) {
        this.__serializer = serializer;
    }
    FileSystem.prototype.serializer = function () {
        return this.__serializer;
    };
    FileSystem.prototype.setSerializer = function (serializer) {
        this.__serializer = serializer;
    };
    FileSystem.prototype.doNotSerialize = function () {
        this.__serializer = null;
    };
    FileSystem.prototype.contextualize = function (ctx) {
        return new ContextualFileSystem_1.ContextualFileSystem(this, ctx);
    };
    FileSystem.prototype.resource = function (ctx, path) {
        return new Resource_1.Resource(path, this, ctx);
    };
    FileSystem.prototype.fastExistCheckEx = function (ctx, _path, errorCallback, callback) {
        if (!this._fastExistCheck)
            return callback();
        var path = new Path_1.Path(_path);
        this._fastExistCheck(ctx, path, function (exists) {
            if (!exists)
                errorCallback(Errors_1.Errors.ResourceNotFound);
            else
                callback();
        });
    };
    FileSystem.prototype.fastExistCheckExReverse = function (ctx, _path, errorCallback, callback) {
        if (!this._fastExistCheck)
            return callback();
        var path = new Path_1.Path(_path);
        this._fastExistCheck(ctx, path, function (exists) {
            if (exists)
                errorCallback(Errors_1.Errors.ResourceAlreadyExists);
            else
                callback();
        });
    };
    FileSystem.prototype.fastExistCheck = function (ctx, _path, callback) {
        if (!this._fastExistCheck)
            return callback(true);
        var path = new Path_1.Path(_path);
        this._fastExistCheck(ctx, path, function (exists) { return callback(!!exists); });
    };
    FileSystem.prototype.create = function (ctx, _path, type, _createIntermediates, _callback) {
        var _this = this;
        var createIntermediates = _callback ? _createIntermediates : false;
        var callback = _callback ? _callback : _createIntermediates;
        var path = new Path_1.Path(_path);
        if (!this._create)
            return callback(Errors_1.Errors.InvalidOperation);
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, function () {
            var go = function () {
                _this._create(path, {
                    context: ctx,
                    type: type
                }, callback);
            };
            _this.isLocked(ctx, path, function (e, locked) {
                if (e || locked)
                    return callback(locked ? Errors_1.Errors.Locked : e);
                _this.fastExistCheckExReverse(ctx, path, callback, function () {
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
            });
        });
    };
    FileSystem.prototype.etag = function (ctx, _path, callback) {
        var _this = this;
        var path = new Path_1.Path(_path);
        issuePrivilegeCheck(this, ctx, path, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, path, callback, function () {
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
        });
    };
    FileSystem.prototype.delete = function (ctx, _path, _depth, _callback) {
        var _this = this;
        var depth = _callback ? _depth : -1;
        var callback = _callback ? _callback : _depth;
        var path = new Path_1.Path(_path);
        if (!this._delete)
            return callback(Errors_1.Errors.InvalidOperation);
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, function () {
            _this.isLocked(ctx, path, function (e, isLocked) {
                if (e || isLocked)
                    return callback(e ? e : Errors_1.Errors.Locked);
                _this.fastExistCheckEx(ctx, path, callback, function () {
                    _this._delete(path, {
                        context: ctx,
                        depth: depth
                    }, callback);
                });
            });
        });
    };
    FileSystem.prototype.openWriteStream = function (ctx, _path, _mode, _targetSource, _estimatedSize, _callback) {
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
        var path = new Path_1.Path(_path);
        var created = false;
        if (!this._openWriteStream)
            return callback(Errors_1.Errors.InvalidOperation);
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canWriteContentSource' : 'canWriteContentTranslated', callback, function () {
            _this.isLocked(ctx, path, function (e, isLocked) {
                if (e || isLocked)
                    return callback(e ? e : Errors_1.Errors.Locked);
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
                        _this.fastExistCheckEx(ctx, path, callback, function () { return go(callback); });
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
            });
        });
    };
    FileSystem.prototype.openReadStream = function (ctx, _path, _targetSource, _estimatedSize, _callback) {
        var _this = this;
        var targetSource = _targetSource.constructor === Boolean ? _targetSource : true;
        var estimatedSize = _callback ? _estimatedSize : _estimatedSize ? _targetSource : -1;
        var callback = _callback ? _callback : _estimatedSize ? _estimatedSize : _targetSource;
        var path = new Path_1.Path(_path);
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, function () {
            _this.fastExistCheckEx(ctx, path, callback, function () {
                if (!_this._openReadStream)
                    return callback(Errors_1.Errors.InvalidOperation);
                _this._openReadStream(path, {
                    context: ctx,
                    estimatedSize: estimatedSize,
                    targetSource: targetSource
                }, callback);
            });
        });
    };
    FileSystem.prototype.move = function (ctx, _pathFrom, _pathTo, _overwrite, _callback) {
        var _this = this;
        var callback = _callback ? _callback : _overwrite;
        var overwrite = _callback ? _overwrite : false;
        var pathFrom = new Path_1.Path(_pathFrom);
        var pathTo = new Path_1.Path(_pathTo);
        issuePrivilegeCheck(this, ctx, pathFrom, 'canRead', callback, function () {
            issuePrivilegeCheck(_this, ctx, pathTo, 'canWrite', callback, function () {
                _this.isLocked(ctx, pathFrom, function (e, isLocked) {
                    if (e || isLocked)
                        return callback(e ? e : Errors_1.Errors.Locked);
                    _this.isLocked(ctx, pathTo, function (e, isLocked) {
                        if (e || isLocked)
                            return callback(e ? e : Errors_1.Errors.Locked);
                        var go = function () {
                            if (_this._move) {
                                _this._move(pathFrom, pathTo, {
                                    context: ctx,
                                    overwrite: overwrite
                                }, callback);
                                return;
                            }
                            StandardMethods_1.StandardMethods.standardMove(ctx, pathFrom, _this, pathTo, _this, overwrite, callback);
                        };
                        _this.fastExistCheckEx(ctx, pathFrom, callback, function () {
                            if (!overwrite)
                                _this.fastExistCheckExReverse(ctx, pathTo, callback, go);
                            else
                                go();
                        });
                    });
                });
            });
        });
    };
    FileSystem.prototype.copy = function (ctx, _pathFrom, _pathTo, _overwrite, _depth, _callback) {
        var _this = this;
        var overwrite = _overwrite.constructor === Boolean ? _overwrite : false;
        var depth = _callback ? _depth : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite : -1;
        var callback = _callback ? _callback : _depth ? _depth : _overwrite;
        var pathFrom = new Path_1.Path(_pathFrom);
        var pathTo = new Path_1.Path(_pathTo);
        issuePrivilegeCheck(this, ctx, pathFrom, 'canRead', callback, function () {
            issuePrivilegeCheck(_this, ctx, pathTo, 'canWrite', callback, function () {
                _this.isLocked(ctx, pathTo, function (e, isLocked) {
                    if (e || isLocked)
                        return callback(e ? e : Errors_1.Errors.Locked);
                    var go = function () {
                        if (_this._copy) {
                            _this._copy(pathFrom, pathTo, {
                                context: ctx,
                                depth: depth,
                                overwrite: overwrite
                            }, callback);
                            return;
                        }
                        StandardMethods_1.StandardMethods.standardCopy(ctx, pathFrom, _this, pathTo, _this, overwrite, depth, callback);
                    };
                    _this.fastExistCheckEx(ctx, pathFrom, callback, function () {
                        if (!overwrite)
                            _this.fastExistCheckExReverse(ctx, pathTo, callback, go);
                        else
                            go();
                    });
                });
            });
        });
    };
    FileSystem.prototype.rename = function (ctx, _pathFrom, newName, _overwrite, _callback) {
        var _this = this;
        var overwrite = _callback ? _overwrite : false;
        var callback = _callback ? _callback : _overwrite;
        var pathFrom = new Path_1.Path(_pathFrom);
        issuePrivilegeCheck(this, ctx, pathFrom, ['canRead', 'canWrite'], callback, function () {
            _this.isLocked(ctx, pathFrom, function (e, isLocked) {
                if (e || isLocked)
                    return callback(e ? e : Errors_1.Errors.Locked);
                if (pathFrom.isRoot()) {
                    _this.getFullPath(ctx, function (e, fullPath) {
                        if (fullPath.isRoot())
                            return callback(Errors_1.Errors.InvalidOperation);
                        var newPath = fullPath.getParent().getChildPath(newName);
                        issuePrivilegeCheck(_this, ctx, newPath, 'canWrite', callback, function () {
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
                    });
                    return;
                }
                _this.fastExistCheckEx(ctx, pathFrom, callback, function () {
                    _this.fastExistCheckExReverse(ctx, pathFrom.getParent().getChildPath(newName), callback, function () {
                        var newPath = pathFrom.getParent().getChildPath(newName);
                        _this.isLocked(ctx, newPath, function (e, isLocked) {
                            if (e || isLocked)
                                return callback(e ? e : Errors_1.Errors.Locked);
                            issuePrivilegeCheck(_this, ctx, newPath, 'canWrite', callback, function () {
                                if (_this._rename) {
                                    _this._rename(pathFrom, newName, {
                                        context: ctx,
                                        destinationPath: newPath
                                    }, callback);
                                    return;
                                }
                            });
                            _this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
                        });
                    });
                });
            });
        });
    };
    FileSystem.prototype.mimeType = function (ctx, _path, _targetSource, _callback) {
        var _this = this;
        var targetSource = _callback ? _targetSource : true;
        var callback = _callback ? _callback : _targetSource;
        var path = new Path_1.Path(_path);
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, function () {
            _this.fastExistCheckEx(ctx, path, callback, function () {
                if (_this._mimeType) {
                    _this._mimeType(path, {
                        context: ctx,
                        targetSource: targetSource
                    }, callback);
                    return;
                }
                StandardMethods_1.StandardMethods.standardMimeType(ctx, _this, path, targetSource, callback);
            });
        });
    };
    FileSystem.prototype.size = function (ctx, path, _targetSource, _callback) {
        var _this = this;
        var targetSource = _callback ? _targetSource : true;
        var callback = _callback ? _callback : _targetSource;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._size)
                    return callback(null, undefined);
                _this._size(pPath, {
                    context: ctx,
                    targetSource: targetSource
                }, callback);
            });
        });
    };
    FileSystem.prototype.availableLocks = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canWriteLocks', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._availableLocks)
                    return callback(null, [
                        new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write),
                        new LockKind_1.LockKind(LockScope_1.LockScope.Shared, LockType_1.LockType.Write)
                    ]);
                _this._availableLocks(pPath, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.lockManager = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        this.fastExistCheckEx(ctx, pPath, callback, function () {
            _this._lockManager(pPath, {
                context: ctx
            }, function (e, lm) {
                if (e)
                    return callback(e);
                var buffIsLocked = new BufferedIsLocked(_this, ctx, pPath);
                var fs = _this;
                callback(null, {
                    getLocks: function (callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, function () {
                            lm.getLocks(callback);
                        });
                    },
                    setLock: function (lock, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.setLock(lock, callback);
                            });
                        });
                    },
                    removeLock: function (uuid, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.removeLock(uuid, callback);
                            });
                        });
                    },
                    getLock: function (uuid, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, function () {
                            lm.getLock(uuid, callback);
                        });
                    },
                    refresh: function (uuid, timeout, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.refresh(uuid, timeout, callback);
                            });
                        });
                    }
                });
            });
        });
    };
    FileSystem.prototype.propertyManager = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        this.fastExistCheckEx(ctx, pPath, callback, function () {
            _this._propertyManager(pPath, {
                context: ctx
            }, function (e, pm) {
                if (e)
                    return callback(e);
                var buffIsLocked = new BufferedIsLocked(_this, ctx, pPath);
                var fs = _this;
                callback(null, {
                    setProperty: function (name, value, attributes, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                pm.setProperty(name, value, attributes, callback);
                            });
                        });
                    },
                    getProperty: function (name, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, function () {
                            pm.getProperty(name, callback);
                        });
                    },
                    removeProperty: function (name, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                pm.removeProperty(name, callback);
                            });
                        });
                    },
                    getProperties: function (callback, byCopy) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, function () {
                            pm.getProperties(callback, byCopy);
                        });
                    }
                });
            });
        });
    };
    FileSystem.prototype.readDir = function (ctx, path, _retrieveExternalFiles, _callback) {
        var _this = this;
        var retrieveExternalFiles = _callback ? _retrieveExternalFiles : false;
        var __callback = _callback ? _callback : _retrieveExternalFiles;
        var pPath = new Path_1.Path(path);
        var callback = function (e, data) {
            if (e)
                return _callback(e);
            if (!data)
                data = [];
            _this.getFullPath(ctx, function (e, fsFullPath) {
                new Workflow_1.Workflow()
                    .each(data, function (path, cb) {
                    _this.checkPrivilege(ctx, path, 'canReadProperties', function (e, can) {
                        if (e)
                            cb(e);
                        else
                            cb(null, can ? path : null);
                    });
                })
                    .error(function (e) { return __callback(e); })
                    .done(function () { return __callback(null, data.filter(function (p) { return !!p; }).map(function (p) { return p.fileName(); })); });
            });
        };
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                var next = function (base) {
                    if (!_this._readDir)
                        return callback(null, base);
                    _this._readDir(pPath, {
                        context: ctx
                    }, function (e, paths) {
                        if (e)
                            return callback(e);
                        if (paths.length === 0)
                            return callback(null, base);
                        if (paths[0].constructor === String)
                            base = base.concat(paths.map(function (s) { return pPath.getChildPath(s); }));
                        else
                            base = base.concat(paths);
                        callback(null, base);
                    });
                };
                if (!retrieveExternalFiles)
                    return next([]);
                _this.getFullPath(ctx, function (e, thisFullPath) {
                    if (e)
                        return callback(e);
                    ctx.server.getChildFileSystems(thisFullPath.getChildPath(pPath), function (fss) {
                        _this.localize(ctx, fss.map(function (f) { return f.path; }), function (e, paths) {
                            if (e)
                                return callback(e);
                            next(paths);
                        });
                    });
                });
            });
        });
    };
    FileSystem.prototype.creationDate = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._creationDate && !_this._lastModifiedDate)
                    return callback(null, 0);
                if (!_this._creationDate)
                    return _this.lastModifiedDate(ctx, pPath, callback);
                _this._creationDate(pPath, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.lastModifiedDate = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._creationDate && !_this._lastModifiedDate)
                    return callback(null, 0);
                if (!_this._lastModifiedDate)
                    return _this.creationDate(ctx, pPath, callback);
                _this._lastModifiedDate(pPath, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.webName = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (pPath.isRoot())
                    _this.getFullPath(ctx, function (e, pPath) { return callback(e, e ? null : pPath.fileName()); });
                else
                    callback(null, pPath.fileName());
            });
        });
    };
    FileSystem.prototype.displayName = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._displayName)
                    return _this.webName(ctx, pPath, callback);
                _this._displayName(pPath, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.type = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                _this._type(pPath, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.addSubTree = function (ctx, _rootPath, _tree, _callback) {
        var _this = this;
        var tree = _callback ? _tree : _rootPath;
        var rootPath = _callback ? new Path_1.Path(_rootPath) : new Path_1.Path('/');
        var callback = _callback ? _callback : _tree;
        callback = callback ? callback : function () { };
        if (tree.constructor === CommonTypes_1.ResourceType) {
            this.create(ctx, rootPath, tree, callback);
        }
        else {
            new Workflow_1.Workflow()
                .each(Object.keys(tree), function (name, cb) {
                var value = tree[name];
                var childPath = rootPath.getChildPath(name);
                if (value.constructor === CommonTypes_1.ResourceType)
                    _this.addSubTree(ctx, childPath, value, cb);
                else
                    _this.addSubTree(ctx, childPath, CommonTypes_1.ResourceType.Directory, function (e) {
                        if (e)
                            return cb(e);
                        _this.addSubTree(ctx, childPath, value, cb);
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
        var pStartPath = new Path_1.Path(startPath);
        issuePrivilegeCheck(this, ctx, startPath, 'canReadLocks', callback, function () {
            _this.lockManager(ctx, pStartPath, function (e, lm) {
                if (e === Errors_1.Errors.ResourceNotFound) {
                    lm = {
                        getLocks: function (callback) {
                            callback(null, []);
                        }
                    };
                }
                else if (e)
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
                                pLocks[pStartPath.toString()] = locks;
                            callback(null, pLocks);
                        });
                    };
                    if (!pStartPath.isRoot())
                        return go(_this, pStartPath.getParent());
                    _this.getFullPath(ctx, function (e, fsPath) {
                        if (e)
                            return callback(e);
                        if (fsPath.isRoot()) {
                            var result = {};
                            if (locks && locks.length > 0)
                                result[pStartPath.toString()] = locks;
                            return callback(null, result);
                        }
                        ctx.server.getFileSystem(fsPath.getParent(), function (fs, _, subPath) {
                            go(fs, subPath);
                        });
                    });
                });
            });
        });
    };
    FileSystem.prototype.getFullPath = function (ctx, _path, _callback) {
        var path = _callback ? new Path_1.Path(_path) : undefined;
        var callback = _callback ? _callback : _path;
        ctx.server.getFileSystemPath(this, function (fsPath) {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        });
    };
    FileSystem.prototype.localize = function (ctx, fullPath, callback) {
        this.getFullPath(ctx, function (e, fsFullPath) {
            if (e)
                return callback(e);
            var paths = fullPath.constructor === Array ? fullPath : [fullPath];
            callback(null, paths
                .map(function (p) { return new Path_1.Path(p); })
                .map(function (p) {
                for (var i = 0; i < fsFullPath.paths.length; ++i)
                    p.removeRoot();
                return p;
            }));
        });
    };
    FileSystem.prototype.checkPrivilege = function (ctx, path, privileges, callback) {
        var _this = this;
        if (privileges.constructor === String)
            privileges = [privileges];
        this.getFullPath(ctx, path, function (e, fullPath) {
            _this.privilegeManager(ctx, path, function (e, privilegeManager) {
                if (e)
                    return callback(e);
                var resource = _this.resource(ctx, new Path_1.Path(path));
                privilegeManager.can(fullPath, resource, privileges, callback);
            });
        });
    };
    FileSystem.prototype.privilegeManager = function (ctx, path, callback) {
        if (!this._privilegeManager)
            return callback(null, ctx.server.options.privilegeManager);
        this._privilegeManager(new Path_1.Path(path), {
            context: ctx
        }, callback);
    };
    FileSystem.prototype.isLocked = function (ctx, path, callback) {
        this.listDeepLocks(ctx, path, function (e, locks) {
            if (e)
                return callback(e);
            for (var path_1 in locks)
                if (locks[path_1].some(function (l) { return ctx.user.uid !== l.userUid && l.lockKind.scope.isSame(LockScope_1.LockScope.Exclusive); }))
                    return callback(null, true);
            var isShared = false;
            for (var path_2 in locks)
                for (var _i = 0, _a = locks[path_2]; _i < _a.length; _i++) {
                    var lock = _a[_i];
                    if (lock.lockKind.scope.isSame(LockScope_1.LockScope.Shared)) {
                        isShared = true;
                        if (lock.userUid === ctx.user.uid)
                            return callback(null, false);
                    }
                }
            callback(null, isShared);
        });
    };
    FileSystem.prototype.serialize = function (callback) {
        var serializer = this.serializer();
        if (!serializer)
            return callback();
        serializer.serialize(this, callback);
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
function issuePrivilegeCheck(fs, ctx, path, privilege, badCallback, goodCallback) {
    fs.checkPrivilege(ctx, path, privilege, function (e, can) {
        if (e)
            badCallback(e);
        else if (!can)
            badCallback(Errors_1.Errors.NotEnoughPrivilege);
        else
            goodCallback();
    });
}
