"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Errors_1 = require("../../../Errors");
var https = require("https");
var http = require("http");
var zlib = require("zlib");
var fs = require("fs");
function autoSave(options) {
    var _this = this;
    if (!options.streamProvider)
        options.streamProvider = function (s, cb) { return cb(s); };
    if (!options.onSaveError)
        options.onSaveError = function () { };
    var saving = false;
    var saveRequested = false;
    this.afterRequest(function (arg, next) {
        switch (arg.request.method.toUpperCase()) {
            case 'PROPPATCH':
            case 'DELETE':
            case 'MKCOL':
            case 'MOVE':
            case 'COPY':
            case 'POST':
            case 'PUT':
                // Avoid concurrent saving
                if (saving) {
                    saveRequested = true;
                    next();
                    return;
                }
                var save_1 = function () {
                    this.save(function (e, data) {
                        if (e) {
                            options.onSaveError(e);
                            next();
                        }
                        else {
                            var stream_1 = zlib.createGzip();
                            options.streamProvider(stream_1, function (outputStream) {
                                if (!outputStream)
                                    outputStream = stream_1;
                                outputStream.pipe(fs.createWriteStream(options.tempTreeFilePath));
                                stream_1.end(JSON.stringify(data), function (e) {
                                    if (e) {
                                        options.onSaveError(e);
                                        next();
                                        return;
                                    }
                                });
                                stream_1.on('close', function () {
                                    fs.unlink(options.treeFilePath, function (e) {
                                        if (e && e.code !== 'ENOENT') // An error other than ENOENT (no file/folder found)
                                         {
                                            options.onSaveError(e);
                                            next();
                                            return;
                                        }
                                        fs.rename(options.tempTreeFilePath, options.treeFilePath, function (e) {
                                            if (e)
                                                options.onSaveError(e);
                                            next();
                                        });
                                    });
                                });
                            });
                        }
                    });
                };
                saving = true;
                next = function () {
                    if (saveRequested) {
                        saveRequested = false;
                        save_1.bind(_this)();
                    }
                    else
                        saving = false;
                };
                save_1.bind(_this)();
                break;
            default:
                next();
                break;
        }
    });
}
function start(port, callback) {
    var _this = this;
    var _port = this.options.port;
    var _callback;
    if (port && port.constructor === Number) {
        _port = port;
        if (callback) {
            if (callback instanceof Function)
                _callback = callback;
            else
                throw Errors_1.Errors.IllegalArguments;
        }
    }
    else if (port && port.constructor === Function) {
        _port = this.options.port;
        _callback = port;
        if (callback)
            throw Errors_1.Errors.IllegalArguments;
    }
    if (!this.server) {
        var serverCreator = this.options.https ? function (c) { return https.createServer(_this.options.https, c); } : function (c) { return http.createServer(c); };
        this.server = serverCreator(function (req, res) {
            var method = _this.methods[_this.normalizeMethodName(req.method)];
            if (!method)
                method = _this.unknownMethod;
            WebDAVRequest_1.MethodCallArgs.create(_this, req, res, function (e, base) {
                if (e) {
                    if (e === Errors_1.Errors.AuenticationPropertyMissing || e === Errors_1.Errors.MissingAuthorisationHeader || e === Errors_1.Errors.BadAuthentication || e === Errors_1.Errors.WrongHeaderFormat)
                        base.setCode(WebDAVRequest_1.HTTPCodes.Unauthorized);
                    else
                        base.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                    res.end();
                    return;
                }
                base.exit = function () {
                    base.response.end();
                    _this.invokeAfterRequest(base, null);
                };
                if (!_this.options.canChunk || !method.chunked) {
                    var go_1 = function () {
                        _this.invokeBeforeRequest(base, function () {
                            method(base, base.exit);
                        });
                    };
                    if (base.contentLength <= 0) {
                        base.data = Buffer.alloc(0);
                        go_1();
                    }
                    else {
                        var data_1 = Buffer.alloc(base.contentLength);
                        var index_1 = 0;
                        req.on('data', function (chunk) {
                            if (chunk.constructor === String)
                                chunk = Buffer.from(chunk);
                            for (var i = 0; i < chunk.length && index_1 < data_1.length; ++i, ++index_1)
                                data_1[index_1] = chunk[i];
                            if (index_1 >= base.contentLength) {
                                base.data = data_1;
                                go_1();
                            }
                        });
                    }
                }
                else {
                    _this.invokeBeforeRequest(base, function () {
                        method.chunked(base, base.exit);
                    });
                }
            });
        });
        if (this.options.autoSave)
            autoSave.bind(this)(this.options.autoSave);
    }
    this.server.listen(_port, this.options.hostname, function () {
        if (_callback)
            _callback(_this.server);
    });
}
exports.start = start;
function stop(callback) {
    if (this.server) {
        this.server.close(callback);
        this.server = null;
    }
    else
        process.nextTick(callback);
}
exports.stop = stop;
