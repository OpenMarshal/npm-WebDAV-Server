"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Errors_1 = require("../../Errors");
var http = require("http");
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
        this.server = http.createServer(function (req, res) {
            var method = _this.methods[_this.normalizeMethodName(req.method)];
            if (!method)
                method = _this.unknownMethod;
            WebDAVRequest_1.MethodCallArgs.create(_this, req, res, function (e, base) {
                if (e) {
                    if (e === Errors_1.Errors.AuenticationPropertyMissing)
                        base.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                    else
                        base.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                    res.end();
                    return;
                }
                base.exit = function () {
                    base.response.end();
                    _this.invokeAfterRequest(base, null);
                };
                if (!_this.options.canChunk || !method.startChunked || base.contentLength <= 0) {
                    var go_1 = function () {
                        _this.invokeBeforeRequest(base, function () {
                            method(base, base.exit);
                        });
                    };
                    if (base.contentLength <= 0) {
                        base.data = new Buffer(0);
                        go_1();
                    }
                    else {
                        var data_1 = new Buffer(base.contentLength);
                        var index_1 = 0;
                        req.on('data', function (chunk) {
                            if (chunk.constructor === String)
                                chunk = new Buffer(chunk);
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
                        _this.invokeBeforeRequest(base, function () {
                            method.startChunked(base, function (error, onData) {
                                if (error) {
                                    base.setCode(error.HTTPCode);
                                    base.exit();
                                    return;
                                }
                                if (!onData) {
                                    base.exit();
                                    return;
                                }
                                var size = 0;
                                req.on('data', function (chunk) {
                                    if (chunk.constructor === String)
                                        chunk = new Buffer(chunk);
                                    size += chunk.length;
                                    onData(chunk, size === chunk.length, size >= base.contentLength);
                                });
                            });
                        });
                    });
                }
            });
        });
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
