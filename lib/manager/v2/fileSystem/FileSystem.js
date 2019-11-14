"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonTypes_1 = require("./CommonTypes");
var stream_1 = require("stream");
var ContextualFileSystem_1 = require("./ContextualFileSystem");
var StandardMethods_1 = require("./StandardMethods");
var LockScope_1 = require("../../../resource/v2/lock/LockScope");
var LockType_1 = require("../../../resource/v2/lock/LockType");
var LockKind_1 = require("../../../resource/v2/lock/LockKind");
var Workflow_1 = require("../../../helper/Workflow");
var Resource_1 = require("./Resource");
var Errors_1 = require("../../../Errors");
var Path_1 = require("../Path");
var crypto = require("crypto");
var promise_1 = require("../../../helper/v2/promise");
var BufferedIsLocked = /** @class */ (function () {
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
/**
 * File system which manage resources under its mounted path.
 *
 * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Custom-File-System-%5Bv2%5D
 */
var FileSystem = /** @class */ (function () {
    function FileSystem(serializer) {
        this.__serializer = serializer;
    }
    /**
     * Get the serializer.
     */
    FileSystem.prototype.serializer = function () {
        return this.__serializer;
    };
    /**
     * Defines the serializer to use.
     *
     * @param serializer Serializer to use.
     */
    FileSystem.prototype.setSerializer = function (serializer) {
        this.__serializer = serializer;
    };
    /**
     * Tell to not serialize this file system.
     */
    FileSystem.prototype.doNotSerialize = function () {
        this.__serializer = null;
    };
    /**
     * Wrap the file system with the context.
     *
     * @param ctx Context of the operation.
     */
    FileSystem.prototype.contextualize = function (ctx) {
        return new ContextualFileSystem_1.ContextualFileSystem(this, ctx);
    };
    /**
     * Wrap the file system with the context and a resource path.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.resource = function (ctx, path) {
        return new Resource_1.Resource(path, this, ctx);
    };
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'errorCallback' is called, otherwise the 'callback' is called.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource is sure to not exist.
     * @param callback Callback to call when the resource might exists.
     */
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
    /**
     * Make a fast check if the resource exists.
     * If '_fastExistCheck' is not implemented, this method call 'callback'.
     * If '_fastExistCheck' is implemented and it returns 'false', then the 'callback' is called, otherwise the 'errorCallback' is called.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param errorCallback Callback to call when the resource might exists.
     * @param callback Callback to call when the resource is sure to not exist.
     */
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
    /**
     * Make a fast check if a resource exists.
     * This method will call '_fastExistCheck' if it is implemented or return 'true'.
     *
     * This method will not give a true information, but just an estimate of the existence of a resource.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns if the resource exists.
     */
    FileSystem.prototype.fastExistCheck = function (ctx, _path, callback) {
        if (!this._fastExistCheck)
            return callback(true);
        var path = new Path_1.Path(_path);
        this._fastExistCheck(ctx, path, function (exists) { return callback(!!exists); });
    };
    FileSystem.prototype.createAsync = function (ctx, path, type, createIntermediates) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.create(ctx, path, type, createIntermediates, cb); });
    };
    FileSystem.prototype.create = function (ctx, _path, type, _createIntermediates, _callback) {
        var _this = this;
        var createIntermediates = promise_1.ensureValue(_callback ? _createIntermediates : undefined, false);
        var callbackFinal = _callback ? _callback : _createIntermediates;
        var path = new Path_1.Path(_path);
        var callback = function (e) {
            if (!e)
                _this.emit('create', ctx, path, { type: type, createIntermediates: createIntermediates });
            callbackFinal(e);
        };
        if (!this._create)
            return callback(Errors_1.Errors.InvalidOperation);
        this.emit('before-create', ctx, path, { type: type, createIntermediates: createIntermediates });
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, function () {
            var go = function () {
                ctx.server.options.storageManager.evaluateCreate(ctx, _this, path, type, function (size) {
                    ctx.server.options.storageManager.reserve(ctx, _this, size, function (reserved) {
                        if (!reserved)
                            return callback(Errors_1.Errors.InsufficientStorage);
                        _this._create(path, {
                            context: ctx,
                            type: type
                        }, function (e) {
                            if (e)
                                ctx.server.options.storageManager.reserve(ctx, _this, -size, function () { return callback(e); });
                            else
                                callback();
                        });
                    });
                });
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
                                    r.create(CommonTypes_1.ResourceType.Directory, true, function (e) {
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
    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     */
    FileSystem.prototype.etagAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.etag(ctx, path, cb); });
    };
    /**
     * Get the etag of the resource.
     * The default etag, if '_etag' is not implemented, is to hash the last modified date information of the resource and wrap it with quotes.
     *
     * @param ctx Context of the operation.
     * @param _path Path of the resource.
     * @param callback Returns the etag of the resource.
     */
    FileSystem.prototype.etag = function (ctx, _path, callback) {
        var _this = this;
        var path = new Path_1.Path(_path);
        issuePrivilegeCheck(this, ctx, path, 'canReadProperties', callback, function () {
            _this.fastExistCheckEx(ctx, path, callback, function () {
                if (!_this._etag)
                    return _this.lastModifiedDate(ctx, path, function (e, date) {
                        if (e)
                            return callback(e);
                        date = FileSystem.neutralizeEmptyDate(date);
                        callback(null, '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"');
                    });
                _this._etag(path, {
                    context: ctx
                }, callback);
            });
        });
    };
    FileSystem.prototype.deleteAsync = function (ctx, path, depth) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.delete(ctx, path, depth, cb); });
    };
    FileSystem.prototype.delete = function (ctx, _path, _depth, _callback) {
        var _this = this;
        var depth = promise_1.ensureValue(_callback ? _depth : undefined, -1);
        var callbackFinal = _callback ? _callback : _depth;
        var path = new Path_1.Path(_path);
        var callback = function (e) {
            if (!e)
                _this.emit('delete', ctx, path, { depth: depth });
            callbackFinal(e);
        };
        if (!this._delete)
            return callback(Errors_1.Errors.InvalidOperation);
        this.emit('before-delete', ctx, path, { depth: depth });
        issuePrivilegeCheck(this, ctx, path, 'canWrite', callback, function () {
            _this.isLocked(ctx, path, function (e, isLocked) {
                if (e || isLocked)
                    return callback(e ? e : Errors_1.Errors.Locked);
                _this.fastExistCheckEx(ctx, path, callback, function () {
                    _this.size(ctx, path, function (e, contentSize) {
                        contentSize = contentSize || 0;
                        _this._delete(path, {
                            context: ctx,
                            depth: depth
                        }, function (e) {
                            if (!e) {
                                _this.type(ctx, path, function (e, type) {
                                    ctx.server.options.storageManager.evaluateContent(ctx, _this, contentSize, function (reservedContentSize) {
                                        ctx.server.options.storageManager.evaluateCreate(ctx, _this, path, type, function (size) {
                                            ctx.server.options.storageManager.reserve(ctx, _this, -size - reservedContentSize, function () {
                                                callback();
                                            });
                                        });
                                    });
                                });
                            }
                            else
                                callback(e);
                        });
                    });
                });
            });
        });
    };
    FileSystem.prototype.openWriteStreamAsync = function (ctx, path, mode, targetSource, estimatedSize) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.openWriteStream(ctx, path, mode, targetSource, estimatedSize, function (e, data1, data2) { return cb(e, e ? undefined : { stream: data1, created: data2 }); }); });
    };
    FileSystem.prototype.openWriteStream = function (ctx, _path, _mode, _targetSource, _estimatedSize, _callback) {
        var _this = this;
        var targetSource = false;
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
        var callbackFinal;
        for (var _d = 0, _e = [_mode, _targetSource, _estimatedSize, _callback]; _d < _e.length; _d++) {
            var obj = _e[_d];
            if (obj && obj.constructor === Function)
                callbackFinal = obj;
        }
        var mode = _mode && _mode.constructor === String ? _mode : 'mustExist';
        var path = new Path_1.Path(_path);
        var created = false;
        var callback = function (e, stream, created) {
            if (!e)
                _this.emit('openWriteStream', ctx, path, { targetSource: targetSource, mode: mode, estimatedSize: estimatedSize, created: created, stream: stream });
            callbackFinal(e, stream, created);
        };
        if (!this._openWriteStream)
            return callback(Errors_1.Errors.InvalidOperation);
        this.emit('before-openWriteStream', ctx, path, { targetSource: targetSource, mode: mode, estimatedSize: estimatedSize, created: created });
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canWriteContentSource' : 'canWriteContentTranslated', callback, function () {
            _this.isLocked(ctx, path, function (e, isLocked) {
                if (e || isLocked)
                    return callback(e ? e : Errors_1.Errors.Locked);
                var finalGo = function (callback) {
                    _this._openWriteStream(path, {
                        context: ctx,
                        estimatedSize: estimatedSize,
                        targetSource: targetSource,
                        mode: mode
                    }, function (e, wStream) { return callback(e, wStream, created); });
                };
                var go = function (callback) {
                    _this.size(ctx, path, true, function (e, size) {
                        ctx.server.options.storageManager.evaluateContent(ctx, _this, size, function (sizeStored) {
                            if (estimatedSize === undefined || estimatedSize === null || estimatedSize.constructor === Number && estimatedSize <= 0) {
                                ctx.server.options.storageManager.available(ctx, _this, function (available) {
                                    if (available === -1)
                                        return finalGo(callback);
                                    if (available === 0)
                                        return callback(Errors_1.Errors.InsufficientStorage);
                                    var nb = 0;
                                    finalGo(function (e, wStream, created) {
                                        if (e)
                                            return callback(e, wStream, created);
                                        var stream = new stream_1.Transform({
                                            transform: function (chunk, encoding, callback) {
                                                nb += chunk.length;
                                                if (nb > available)
                                                    callback(Errors_1.Errors.InsufficientStorage);
                                                else
                                                    callback(null, chunk, encoding);
                                            }
                                        });
                                        stream.pipe(wStream);
                                        stream.on('finish', function () {
                                            ctx.server.options.storageManager.reserve(ctx, _this, nb, function (reserved) {
                                                if (!reserved)
                                                    stream.emit('error', Errors_1.Errors.InsufficientStorage);
                                            });
                                        });
                                        callback(e, stream, created);
                                    });
                                });
                            }
                            else {
                                ctx.server.options.storageManager.evaluateContent(ctx, _this, estimatedSize, function (estimatedSizeStored) {
                                    ctx.server.options.storageManager.reserve(ctx, _this, estimatedSizeStored - sizeStored, function (reserved) {
                                        if (!reserved)
                                            return callback(Errors_1.Errors.InsufficientStorage);
                                        finalGo(callback);
                                    });
                                });
                            }
                        });
                    });
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
    FileSystem.prototype.openReadStreamAsync = function (ctx, path, targetSource, estimatedSize) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.openReadStream(ctx, path, targetSource, estimatedSize, cb); });
    };
    FileSystem.prototype.openReadStream = function (ctx, _path, _targetSource, _estimatedSize, _callback) {
        var _this = this;
        var targetSource = promise_1.ensureValue(_targetSource.constructor === Boolean ? _targetSource : undefined, false);
        var estimatedSize = promise_1.ensureValue(_callback ? _estimatedSize : _estimatedSize ? _targetSource : undefined, -1);
        var callbackFinal = _callback ? _callback : _estimatedSize ? _estimatedSize : _targetSource;
        var path = new Path_1.Path(_path);
        var callback = function (e, stream) {
            if (!e)
                _this.emit('openReadStream', ctx, path, { targetSource: targetSource, estimatedSize: estimatedSize, stream: stream });
            callbackFinal(e, stream);
        };
        this.emit('before-openReadStream', ctx, path, { targetSource: targetSource, estimatedSize: estimatedSize });
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
    FileSystem.prototype.moveAsync = function (ctx, pathFrom, pathTo, overwrite) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.move(ctx, pathFrom, pathTo, overwrite, cb); });
    };
    FileSystem.prototype.move = function (ctx, _pathFrom, _pathTo, _overwrite, _callback) {
        var _this = this;
        var callbackFinal = _callback ? _callback : _overwrite;
        var overwrite = promise_1.ensureValue(_callback ? _overwrite : undefined, false);
        var pathFrom = new Path_1.Path(_pathFrom);
        var pathTo = new Path_1.Path(_pathTo);
        var callback = function (e, overrided) {
            if (!e)
                _this.emit('move', ctx, pathFrom, { pathFrom: pathFrom, pathTo: pathTo, overwrite: overwrite, overrided: overrided });
            callbackFinal(e, overrided);
        };
        this.emit('before-move', ctx, pathFrom, { pathFrom: pathFrom, pathTo: pathTo, overwrite: overwrite });
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
    FileSystem.prototype.copyAsync = function (ctx, pathFrom, pathTo, overwrite, depth) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.copy(ctx, pathFrom, pathTo, overwrite, depth); });
    };
    FileSystem.prototype.copy = function (ctx, _pathFrom, _pathTo, _overwrite, _depth, _callback) {
        var _this = this;
        var overwrite = promise_1.ensureValue(_overwrite.constructor === Boolean ? _overwrite : undefined, false);
        var depth = promise_1.ensureValue(_callback ? _depth : !_depth ? -1 : _overwrite.constructor === Number ? _overwrite : undefined, -1);
        var callbackFinal = _callback ? _callback : _depth ? _depth : _overwrite;
        var pathFrom = new Path_1.Path(_pathFrom);
        var pathTo = new Path_1.Path(_pathTo);
        var callback = function (e, overrided) {
            if (!e)
                _this.emit('copy', ctx, pathFrom, { pathTo: pathTo, overwrite: overwrite, overrided: overrided, depth: depth });
            callbackFinal(e, overrided);
        };
        this.emit('before-copy', ctx, pathFrom, { pathTo: pathTo, overwrite: overwrite, depth: depth });
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
    FileSystem.prototype.renameAsync = function (ctx, pathFrom, newName, overwrite) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.rename(ctx, pathFrom, newName, overwrite, cb); });
    };
    FileSystem.prototype.rename = function (ctx, _pathFrom, newName, _overwrite, _callback) {
        var _this = this;
        var overwrite = promise_1.ensureValue(_callback ? _overwrite : undefined, false);
        var callbackFinal = _callback ? _callback : _overwrite;
        var pathFrom = new Path_1.Path(_pathFrom);
        var callback = function (e, overrided) {
            if (!e)
                _this.emit('rename', ctx, pathFrom, { newName: newName, overrided: overrided });
            callbackFinal(e, overrided);
        };
        this.emit('before-rename', ctx, pathFrom, { newName: newName });
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
                                if (!subPath.isRoot()) {
                                    go(false);
                                }
                                else if (!overwrite) {
                                    callback(Errors_1.Errors.ResourceAlreadyExists);
                                }
                                else {
                                    ctx.server.removeFileSystem(newPath, function () {
                                        go(true);
                                    });
                                }
                            });
                        });
                    });
                }
                else {
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
                                    }
                                    else {
                                        _this.move(ctx, pathFrom, pathFrom.getParent().getChildPath(newName), overwrite, callback);
                                    }
                                });
                            });
                        });
                    });
                }
            });
        });
    };
    FileSystem.prototype.mimeTypeAsync = function (ctx, path, targetSource) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.mimeType(ctx, path, targetSource, cb); });
    };
    FileSystem.prototype.mimeType = function (ctx, _path, _targetSource, _callback) {
        var _this = this;
        var targetSource = promise_1.ensureValue(_callback ? _targetSource : undefined, true);
        var callback = _callback ? _callback : _targetSource;
        var path = new Path_1.Path(_path);
        issuePrivilegeCheck(this, ctx, path, targetSource ? 'canReadContentSource' : 'canReadContentTranslated', callback, function () {
            _this.fastExistCheckEx(ctx, path, callback, function () {
                if (_this._mimeType) {
                    _this._mimeType(path, {
                        context: ctx,
                        targetSource: targetSource
                    }, callback);
                }
                else {
                    StandardMethods_1.StandardMethods.standardMimeType(ctx, _this, path, targetSource, callback);
                }
            });
        });
    };
    FileSystem.prototype.sizeAsync = function (ctx, path, targetSource) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.size(ctx, path, targetSource, cb); });
    };
    FileSystem.prototype.size = function (ctx, path, _targetSource, _callback) {
        var _this = this;
        var targetSource = promise_1.ensureValue(_callback ? _targetSource : undefined, false);
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
    /**
     * Get the list of available lock kinds.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.availableLocksAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.availableLocks(ctx, path, cb); });
    };
    /**
     * Get the list of available lock kinds.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the list of available lock kinds.
     */
    FileSystem.prototype.availableLocks = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        issuePrivilegeCheck(this, ctx, pPath, 'canReadLocks', callback, function () {
            _this.fastExistCheckEx(ctx, pPath, callback, function () {
                if (!_this._availableLocks) {
                    callback(null, [
                        new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write),
                        new LockKind_1.LockKind(LockScope_1.LockScope.Shared, LockType_1.LockType.Write)
                    ]);
                }
                else {
                    _this._availableLocks(pPath, {
                        context: ctx
                    }, callback);
                }
            });
        });
    };
    /**
     * Get the lock manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.lockManagerAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.lockManager(ctx, path, cb); });
    };
    /**
     * Get the lock manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the lock manager of the resource.
     */
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
                var manager = {
                    getLocksAsync: function () {
                        return promise_1.promisifyCall(function (cb) { return manager.getLocks(cb); });
                    },
                    getLocks: function (callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, function () {
                            lm.getLocks(callback);
                        });
                    },
                    setLockAsync: function (lock) {
                        return promise_1.promisifyCall(function (cb) { return manager.setLock(lock, cb); });
                    },
                    setLock: function (lock, callback) {
                        fs.emit('before-lock-set', ctx, pPath, { lock: lock });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.setLock(lock, function (e) {
                                    if (!e)
                                        fs.emit('lock-set', ctx, pPath, { lock: lock });
                                    callback(e);
                                });
                            });
                        });
                    },
                    removeLockAsync: function (uuid) {
                        return promise_1.promisifyCall(function (cb) { return manager.removeLock(uuid, cb); });
                    },
                    removeLock: function (uuid, callback) {
                        fs.emit('before-lock-remove', ctx, pPath, { uuid: uuid });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.removeLock(uuid, function (e, removed) {
                                    if (!e)
                                        fs.emit('lock-remove', ctx, pPath, { uuid: uuid, removed: removed });
                                    callback(e, removed);
                                });
                            });
                        });
                    },
                    getLockAsync: function (uuid) {
                        return promise_1.promisifyCall(function (cb) { return manager.getLock(uuid, cb); });
                    },
                    getLock: function (uuid, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadLocks', callback, function () {
                            lm.getLock(uuid, callback);
                        });
                    },
                    refreshAsync: function (uuid, timeoutSeconds) {
                        return promise_1.promisifyCall(function (cb) { return manager.refresh(uuid, timeoutSeconds, cb); });
                    },
                    refresh: function (uuid, timeoutSeconds, callback) {
                        fs.emit('before-lock-refresh', ctx, pPath, { uuid: uuid, timeout: timeoutSeconds });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteLocks', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                lm.refresh(uuid, timeoutSeconds, function (e, lock) {
                                    if (!e)
                                        fs.emit('lock-refresh', ctx, pPath, { uuid: uuid, timeout: timeoutSeconds, lock: lock });
                                    callback(e, lock);
                                });
                            });
                        });
                    }
                };
                callback(null, manager);
            });
        });
    };
    /**
     * Get the property manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.propertyManagerAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.propertyManager(ctx, path, cb); });
    };
    /**
     * Get the property manager of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the property manager of the resource.
     */
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
                        fs.emit('before-property-set', ctx, pPath, { name: name, value: value, attributes: attributes });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                pm.setProperty(name, value, attributes, function (e) {
                                    if (!e)
                                        fs.emit('property-set', ctx, pPath, { name: name, value: value, attributes: attributes });
                                    callback(e);
                                });
                            });
                        });
                    },
                    getProperty: function (name, callback) {
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, function () {
                            pm.getProperty(name, callback);
                        });
                    },
                    removeProperty: function (name, callback) {
                        fs.emit('before-property-remove', ctx, pPath, { name: name });
                        issuePrivilegeCheck(fs, ctx, pPath, 'canWriteProperties', callback, function () {
                            buffIsLocked.isLocked(function (e, isLocked) {
                                if (e || isLocked)
                                    return callback(e ? e : Errors_1.Errors.Locked);
                                pm.removeProperty(name, function (e) {
                                    if (!e)
                                        fs.emit('property-remove', ctx, pPath, { name: name });
                                    callback(e);
                                });
                            });
                        });
                    },
                    getProperties: function (callback, byCopy) {
                        var _this = this;
                        issuePrivilegeCheck(fs, ctx, pPath, 'canReadProperties', callback, function () {
                            pm.getProperties(function (e, bag) {
                                if (!bag)
                                    return callback(e, bag);
                                ctx.server.options.storageManager.available(ctx, _this, function (availableSize) {
                                    if (availableSize === -1)
                                        return callback(e, bag);
                                    ctx.server.options.storageManager.reserved(ctx, _this, function (reservedSize) {
                                        bag['DAV:quota-available-bytes'] = {
                                            value: availableSize.toString()
                                        };
                                        bag['DAV:quota-used-bytes'] = {
                                            value: reservedSize.toString()
                                        };
                                        callback(e, bag);
                                    });
                                });
                            }, byCopy);
                        });
                    }
                });
            });
        });
    };
    FileSystem.prototype.readDirAsync = function (ctx, path, retrieveExternalFiles) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.readDir(ctx, path, retrieveExternalFiles, cb); });
    };
    FileSystem.prototype.readDir = function (ctx, path, _retrieveExternalFiles, _callback) {
        var _this = this;
        var retrieveExternalFiles = promise_1.ensureValue(_callback ? _retrieveExternalFiles : undefined, false);
        var __callback = _callback ? _callback : _retrieveExternalFiles;
        var pPath = new Path_1.Path(path);
        var callback = function (e, data) {
            if (e)
                return __callback(e);
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
                    .error(__callback)
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
    FileSystem.neutralizeEmptyDate = function (date, defaultDate) {
        if (!date || isNaN(date)) {
            if (defaultDate === undefined || defaultDate === null)
                defaultDate = 0;
            return defaultDate;
        }
        else {
            return date;
        }
    };
    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.creationDateAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.creationDate(ctx, path, cb); });
    };
    /**
     * Get the creation date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_creationDate' is not implemented, it calls the 'lastModifiedDate' method.
     * Otherwise it calls the '_creationDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the creation date of the resource.
     */
    FileSystem.prototype.creationDate = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        callback = FileSystem.neutralizeEmptyDateCallback(callback);
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
    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.lastModifiedDateAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.lastModifiedDate(ctx, path, cb); });
    };
    /**
     * Get the last modified date information of a resource.
     * If neither '_creationDate' nor '_lastModifiedDate' are implemented, it returns 0.
     * If '_lastModifiedDate' is not implemented, it calls the 'creationDate' method.
     * Otherwise it calls the '_lastModifiedDate' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the last modified date of the resource.
     */
    FileSystem.prototype.lastModifiedDate = function (ctx, path, callback) {
        var _this = this;
        var pPath = new Path_1.Path(path);
        callback = FileSystem.neutralizeEmptyDateCallback(callback);
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
    /**
     * Get the name of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.webNameAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.webName(ctx, path, cb); });
    };
    /**
     * Get the name of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the name of the resource.
     */
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
    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.displayNameAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.displayName(ctx, path, cb); });
    };
    /**
     * Get the 'displayName' information of the resource.
     * This value is used in the 'DAV:displayName' tag in the PROPFIND response body.
     * Its default behaviour is to return the result of the 'webName' method. This behaviour can be overrided by implementing the '_displayName' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the 'displayName' information of the resource.
     */
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
    /**
     * Get the type of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.typeAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.type(ctx, path, cb); });
    };
    /**
     * Get the type of the resource.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the type of the resource.
     */
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
    FileSystem.prototype.addSubTreeAsync = function (ctx, rootPath, tree) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.addSubTree(ctx, rootPath, tree, cb); });
    };
    FileSystem.prototype.addSubTree = function (ctx, _rootPath, _tree, _callback) {
        var _this = this;
        var _rootPathIsPath = Path_1.Path.isPath(_rootPath);
        var tree = _rootPathIsPath ? _tree : _rootPath;
        var rootPath = _rootPathIsPath ? new Path_1.Path(_rootPath) : new Path_1.Path('/');
        var callback = _callback ? _callback : _tree;
        callback = callback ? callback : function () { };
        if (tree.constructor === CommonTypes_1.ResourceType) {
            this.create(ctx, rootPath, tree, callback);
        }
        else if (tree.constructor === String || tree.constructor === Buffer) {
            var data_1 = tree;
            this.openWriteStream(ctx, rootPath, 'mustCreate', true, data_1.length, function (e, w, created) {
                if (e)
                    return callback(e);
                w.end(data_1);
                w.on('error', function (e) {
                    callback(e);
                });
                w.on('finish', function () {
                    callback();
                });
            });
        }
        else {
            new Workflow_1.Workflow()
                .each(Object.keys(tree), function (name, cb) {
                var value = tree[name];
                var childPath = rootPath.getChildPath(name);
                if (value.constructor === CommonTypes_1.ResourceType || value.constructor === String || value.constructor === Buffer) {
                    _this.addSubTree(ctx, childPath, value, cb);
                }
                else {
                    _this.addSubTree(ctx, childPath, CommonTypes_1.ResourceType.Directory, function (e) {
                        if (e)
                            return cb(e);
                        _this.addSubTree(ctx, childPath, value, cb);
                    });
                }
            })
                .error(callback)
                .done(function (_) { return callback(); });
        }
    };
    FileSystem.prototype.listDeepLocksAsync = function (ctx, startPath, depth) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.listDeepLocks(ctx, startPath, depth, cb); });
    };
    FileSystem.prototype.listDeepLocks = function (ctx, startPath, _depth, _callback) {
        var _this = this;
        var depth = promise_1.ensureValue(_callback ? _depth : undefined, 0);
        var callback = _callback ? _callback : _depth;
        var pStartPath = new Path_1.Path(startPath);
        this.lockManager(ctx, pStartPath, function (e, lm) {
            if (e === Errors_1.Errors.ResourceNotFound) {
                lm = {
                    getLocks: function (callback) {
                        callback(null, []);
                    }
                };
            }
            else if (e) {
                return callback(e);
            }
            lm.getLocks(function (e, locks) {
                if (e === Errors_1.Errors.NotEnoughPrivilege) {
                    locks = [];
                }
                else if (e) {
                    return callback(e);
                }
                if (depth !== -1)
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
                if (!pStartPath.isRoot()) {
                    go(_this, pStartPath.getParent());
                }
                else {
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
                }
            });
        });
    };
    FileSystem.prototype.getFullPathAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.getFullPath(ctx, path, cb); });
    };
    FileSystem.prototype.getFullPath = function (ctx, _path, _callback) {
        var path = !_path || typeof _path === 'function' ? undefined : new Path_1.Path(_path);
        var callback = _callback ? _callback : _path;
        ctx.server.getFileSystemPath(this, function (fsPath) {
            callback(null, path ? fsPath.getChildPath(path) : fsPath);
        });
    };
    FileSystem.prototype.localizeAsync = function (ctx, fullPath) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.localize(ctx, fullPath, cb); });
    };
    FileSystem.prototype.localize = function (ctx, fullPath, callback) {
        this.getFullPath(ctx, function (e, fsFullPath) {
            if (e)
                return callback(e);
            var paths = fullPath.constructor === Array ? fullPath : [fullPath];
            callback(null, paths
                .map(function (p) { return new Path_1.Path(p); })
                .map(function (p) {
                fsFullPath.paths.forEach(function () { return p.removeRoot(); });
                return p;
            }));
        });
    };
    FileSystem.prototype.checkPrivilegeAsync = function (ctx, path, privileges) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.checkPrivilege(ctx, path, privileges, cb); });
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
    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     */
    FileSystem.prototype.privilegeManagerAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.privilegeManager(ctx, path, cb); });
    };
    /**
     * Get the privilege manager to use to authorize actions for a user.
     * By default, it returns the value in the server options, but it can be overrided by implementing the '_privilegeManager' method.
     *
     * @param ctx Context of the operation.
     * @param path Path of the resource.
     * @param callback Returns the privilege manager representing the requested resource.
     */
    FileSystem.prototype.privilegeManager = function (ctx, path, callback) {
        if (!this._privilegeManager)
            return callback(null, ctx.server.options.privilegeManager);
        this._privilegeManager(new Path_1.Path(path), {
            context: ctx
        }, callback);
    };
    FileSystem.prototype.isLockedAsync = function (ctx, path, depth) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.isLockedAsync(ctx, path, depth); });
    };
    FileSystem.prototype.isLocked = function (ctx, path, _depth, _callback) {
        var _this = this;
        var callback = _callback ? _callback : _depth;
        var depth = typeof _depth === 'number' ? _depth : 0;
        if (ctx.user && ctx.user.isAdministrator)
            return callback(null, false);
        var pPath = new Path_1.Path(path);
        var checkThis = function () {
            _this._lockManager(pPath, { context: ctx }, function (e, lm) {
                if (e === Errors_1.Errors.ResourceNotFound)
                    return callback(null, false);
                if (e)
                    return callback(e);
                lm.getLocks(function (e, locks) {
                    if (e === Errors_1.Errors.ResourceNotFound)
                        return callback(null, false);
                    if (e)
                        return callback(e);
                    locks = locks.filter(function (l) { return l.depth === -1 || l.depth >= depth; });
                    if (!ctx.user)
                        return callback(null, locks.length > 0);
                    if (locks.some(function (l) { return ctx.user.uid !== l.userUid && l.lockKind.scope.isSame(LockScope_1.LockScope.Exclusive); }))
                        return callback(null, true);
                    var isShared = false;
                    for (var _i = 0, locks_1 = locks; _i < locks_1.length; _i++) {
                        var lock = locks_1[_i];
                        if (lock.lockKind.scope.isSame(LockScope_1.LockScope.Shared)) {
                            isShared = true;
                            if (lock.userUid === ctx.user.uid)
                                return callback(null, false);
                        }
                    }
                    callback(null, isShared);
                });
            });
        };
        this.getFullPath(ctx, pPath, function (e, fullPath) {
            if (fullPath.isRoot())
                return checkThis();
            ctx.server.getFileSystem(pPath.getParent(), function (fs, rootPath, subPath) {
                fs.isLocked(ctx, subPath, depth + 1, function (e, locked) {
                    if (e || locked)
                        return callback(e, locked);
                    checkThis();
                });
            });
        });
    };
    /**
     * Serialize the file system based on the 'this.serializer()' value.
     */
    FileSystem.prototype.serializeAsync = function () {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.serialize(cb); });
    };
    /**
     * Serialize the file system based on the 'this.serializer()' value.
     *
     * @param callback Returns the serialized data or an error.
     */
    FileSystem.prototype.serialize = function (callback) {
        var serializer = this.serializer();
        if (!serializer)
            return callback();
        serializer.serialize(this, callback);
    };
    FileSystem.prototype.on = function (ctx, event, listener) {
        var _this = this;
        var server = ctx.events ? ctx : ctx.server;
        server.on(event, function (ctx, fs, path) {
            if (fs === _this)
                listener(ctx, path);
        });
        return this;
    };
    /**
     * Trigger an event.
     *
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param path Path of the resource on which the event happened.
     */
    FileSystem.prototype.emit = function (event, ctx, path, data) {
        ctx.server.emit(event, ctx, this, path, data);
    };
    FileSystem.neutralizeEmptyDateCallback = function (callback) {
        return function (e, date) {
            callback(e, FileSystem.neutralizeEmptyDate(date));
        };
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
