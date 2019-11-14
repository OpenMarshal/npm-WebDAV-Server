"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Errors_1 = require("../../../Errors");
var https = require("https");
var http = require("http");
function executeRequest(req, res, rootPath) {
    var _this = this;
    var method = this.methods[this.normalizeMethodName(req.method)];
    if (!method)
        method = this.unknownMethod;
    WebDAVRequest_1.HTTPRequestContext.create(this, req, res, rootPath, function (e, base) {
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
        if (!method.chunked) {
            var go_1 = function (data) {
                _this.invokeBeforeRequest(base, function () {
                    method.unchunked(base, data, base.exit);
                });
            };
            if (base.headers.contentLength <= 0) {
                go_1(Buffer.alloc(0));
            }
            else {
                var data_1 = Buffer.alloc(base.headers.contentLength);
                var index_1 = 0;
                req.on('data', function (chunk) {
                    if (chunk.constructor === String)
                        chunk = Buffer.from(chunk);
                    for (var i = 0; i < chunk.length && index_1 < data_1.length; ++i, ++index_1)
                        data_1[index_1] = chunk[i];
                    if (index_1 >= base.headers.contentLength)
                        go_1(data_1);
                });
            }
        }
        else {
            _this.invokeBeforeRequest(base, function () {
                method.chunked(base, req, base.exit);
            });
        }
    });
}
exports.executeRequest = executeRequest;
function start(port, callback) {
    var _this = this;
    var _port = this.options.port;
    var _callback;
    if (port && typeof port === 'number')
        _port = port;
    else if (callback && typeof callback === 'number')
        _port = callback;
    if (port && typeof port === 'function')
        _callback = port;
    else if (callback && typeof callback === 'function')
        _callback = callback;
    if (!this.server) {
        var serverCreator = this.options.https ? function (c) { return https.createServer(_this.options.https, c); } : function (c) { return http.createServer(c); };
        this.server = serverCreator(executeRequest.bind(this));
        this.autoSave();
    }
    this.server.listen(_port, this.options.hostname, function () {
        if (_callback)
            _callback(_this.server);
    });
}
exports.start = start;
function stop(callback) {
    callback = callback ? callback : function () { };
    if (this.server) {
        this.server.close(callback);
        this.server = null;
    }
    else
        process.nextTick(callback);
}
exports.stop = stop;
