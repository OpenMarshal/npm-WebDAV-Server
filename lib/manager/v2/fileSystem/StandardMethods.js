"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var mimeTypes = require("mime-types");
var StandardMethods = /** @class */ (function () {
    function StandardMethods() {
    }
    StandardMethods.standardMove = function (ctx, subPathFrom, fsFrom, subPathTo, fsTo, _overwrite, _callback) {
        var callback = _callback ? _callback : _overwrite;
        var overwrite = _callback ? _overwrite : false;
        var go = function (fullPathFrom) {
            StandardMethods.standardCopy(ctx, subPathFrom, fsFrom, subPathTo, fsTo, overwrite, -1, function (e, overwritten) {
                if (e)
                    return callback(e, overwritten);
                if (fullPathFrom) { // subPathFrom.isRoot() === true
                    ctx.server.removeFileSystem(fullPathFrom, function (nb) {
                        callback(null, overwritten);
                    });
                    return;
                }
                fsFrom.delete(ctx, subPathFrom, -1, function (e) { return callback(e, overwritten); });
            });
        };
        if (subPathFrom.isRoot()) {
            fsFrom.getFullPath(ctx, function (e, fullPathFrom) {
                go(fullPathFrom);
            });
        }
        else
            go();
    };
    StandardMethods.standardCopy = function (ctx, subPathFrom, fsFrom, subPathTo, fsTo, _overwrite, _depth, _callback) {
        var overwrite = _overwrite.constructor === Boolean ? _overwrite : false;
        var depth = _callback ? _depth : (!_depth ? -1 : (_overwrite.constructor === Number ? _overwrite : -1));
        var callback = _callback ? _callback : (_depth ? _depth : _overwrite);
        if (subPathFrom.isRoot()) {
            fsTo.getFullPath(ctx, subPathTo, function (e, fullPathTo) {
                if (e)
                    return callback(e);
                var overwritten = false;
                ctx.server.getResource(ctx, fullPathTo, function (e, r) {
                    if (e)
                        return callback(e);
                    r.type(function (e, type) {
                        if (!e)
                            overwritten = true;
                        ctx.server.setFileSystem(fullPathTo, fsFrom, function (success) {
                            callback(null, overwritten);
                        });
                    });
                });
            });
            return;
        }
        var go = function () {
            var copyProperties = function (callback) {
                fsFrom.propertyManager(ctx, subPathFrom, function (e, pmFrom) {
                    if (e)
                        return callback(e);
                    fsTo.propertyManager(ctx, subPathTo, function (e, pmTo) {
                        if (e)
                            return callback(e);
                        pmFrom.getProperties(function (e, props) {
                            if (e)
                                return callback(e);
                            new Workflow_1.Workflow()
                                .each(Object.keys(props), function (name, cb) {
                                var prop = props[name];
                                pmTo.setProperty(name, prop.value, prop.attributes, cb);
                            })
                                .error(callback)
                                .done(function (_) { return callback(); });
                        });
                    });
                });
            };
            var reverse1 = function (e) {
                fsTo.delete(ctx, subPathTo, function () { return callback(e); });
            };
            var copyContent = function (callback) {
                fsFrom.size(ctx, subPathFrom, true, function (e, size) {
                    fsFrom.openReadStream(ctx, subPathFrom, true, function (e, rStream) {
                        if (e)
                            return reverse1(e);
                        fsTo.openWriteStream(ctx, subPathTo, true, size, function (e, wStream) {
                            if (e)
                                return reverse1(e);
                            var _callback = function (e) {
                                _callback = function () { };
                                callback(e);
                            };
                            rStream.pipe(wStream);
                            rStream.on('error', _callback);
                            wStream.on('error', _callback);
                            wStream.on('finish', function () {
                                _callback(null);
                            });
                        });
                    });
                });
            };
            var copyChildren = function (callback) {
                fsFrom.readDir(ctx, subPathFrom, false, function (e, files) {
                    if (e)
                        return callback(e);
                    var subDepth = depth === -1 ? -1 : Math.max(0, depth - 1);
                    new Workflow_1.Workflow()
                        .each(files, function (file, cb) { return StandardMethods.standardCopy(ctx, subPathFrom.getChildPath(file), fsFrom, subPathTo.getChildPath(file), fsTo, overwrite, subDepth, cb); })
                        .error(callback)
                        .done(function (_) { return callback(); });
                });
            };
            fsFrom.type(ctx, subPathFrom, function (e, type) {
                if (e)
                    return callback(e);
                var overwritten = false;
                var startCopy = function () {
                    var fns = [copyProperties];
                    if (type.isDirectory && depth !== 0)
                        fns.push(copyChildren);
                    if (type.isFile)
                        fns.push(copyContent);
                    new Workflow_1.Workflow()
                        .each(fns, function (fn, cb) { return fn(cb); })
                        .error(function (e) { return callback(e, overwritten); })
                        .done(function () { return callback(null, overwritten); });
                };
                fsTo.create(ctx, subPathTo, type, function (e) {
                    if (e === Errors_1.Errors.ResourceAlreadyExists && overwrite) {
                        fsTo.delete(ctx, subPathTo, -1, function (e) {
                            if (e)
                                return callback(e);
                            overwritten = true;
                            fsTo.create(ctx, subPathTo, type, function (e) {
                                if (e)
                                    return callback(e);
                                startCopy();
                            });
                        });
                        return;
                    }
                    else if (e)
                        return callback(e);
                    startCopy();
                });
            });
        };
        fsFrom.fastExistCheckEx(ctx, subPathFrom, callback, function () {
            if (!overwrite)
                fsTo.fastExistCheckExReverse(ctx, subPathTo, callback, go);
            else
                go();
        });
    };
    StandardMethods.standardMimeType = function (ctx, fs, path, targetSource, _defaultMimeType, _useWebName, _callback) {
        var callback;
        var useWebName = false;
        var defaultMimeType = 'application/octet-stream';
        if (_defaultMimeType.constructor === Function) {
            callback = _defaultMimeType;
        }
        else if (_defaultMimeType.constructor === Boolean) {
            callback = _useWebName;
            if (_defaultMimeType !== undefined && _defaultMimeType !== null)
                useWebName = _defaultMimeType;
        }
        else {
            callback = _callback;
            if (_useWebName !== undefined && _useWebName !== null)
                useWebName = _useWebName;
            if (_defaultMimeType !== undefined && _defaultMimeType !== null)
                defaultMimeType = _defaultMimeType;
        }
        fs.type(ctx, path, function (e, type) {
            if (e)
                return callback(e, null);
            if (type.isFile) {
                var fn = useWebName ? fs.webName : fs.displayName;
                fn.bind(fs)(ctx, path, function (e, name) {
                    if (e)
                        callback(e, null);
                    else {
                        var mt = mimeTypes.contentType(name);
                        callback(null, mt ? mt : defaultMimeType);
                    }
                });
            }
            else
                callback(Errors_1.Errors.NoMimeTypeForAFolder, null);
        });
    };
    return StandardMethods;
}());
exports.StandardMethods = StandardMethods;
