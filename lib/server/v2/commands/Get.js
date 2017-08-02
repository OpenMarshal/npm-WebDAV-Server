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
var WebDAVRequest_1 = require("../WebDAVRequest");
var stream_1 = require("stream");
var RangedStream = (function (_super) {
    __extends(RangedStream, _super);
    function RangedStream(min, max) {
        var _this = _super.call(this) || this;
        _this.min = min;
        _this.max = max;
        _this.nb = 0;
        return _this;
    }
    RangedStream.prototype._transform = function (chunk, encoding, callback) {
        if (this.nb < this.min) {
            var lastNb = this.nb;
            this.nb += chunk.length;
            if (this.nb > this.min) {
                var start = this.min - lastNb;
                chunk = chunk.slice(start, this.nb > this.max ? this.max - this.min + 1 + start : undefined);
                callback(null, chunk);
            }
            else
                callback(null, new Buffer(0));
        }
        else if (this.nb > this.max) {
            this.nb += chunk.length;
            callback(null, new Buffer(0));
        }
        else {
            this.nb += chunk.length;
            if (this.nb > this.max)
                chunk = chunk.slice(0, this.max - (this.nb - chunk.length) + 1);
            callback(null, chunk);
        }
    };
    return RangedStream;
}(stream_1.Transform));
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.getResource(function (e, r) {
                ctx.checkIfHeader(r, function () {
                    var targetSource = ctx.headers.isSource;
                    //ctx.requirePrivilegeEx(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], () => {
                    r.type(function (e, type) {
                        if (e) {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return callback();
                        }
                        if (!type.isFile) {
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                            return callback();
                        }
                        var range = ctx.headers.find('Range');
                        r.size(targetSource, function (e, size) { return process.nextTick(function () {
                            if (e && !range) {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                return callback();
                            }
                            r.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                                if (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    return callback();
                                }
                                r.openReadStream(targetSource, function (e, rstream) {
                                    if (e) {
                                        if (!ctx.setCodeFromError(e))
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                                        return callback();
                                    }
                                    //ctx.invokeEvent('read', r);
                                    if (range) {
                                        var match = /(\d+)-(\d+|)/.exec(range);
                                        var min = match && match[1] ? parseInt(match[1], 10) : 0;
                                        var max = match && match[2] ? parseInt(match[2], 10) : Infinity;
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.PartialContent);
                                        ctx.response.setHeader('Accept-Ranges', 'bytes');
                                        ctx.response.setHeader('Content-Type', mimeType);
                                        ctx.response.setHeader('Content-Length', Math.min(size, max - min + 1).toString());
                                        ctx.response.setHeader('Content-Range', 'bytes ' + min + '-' + max + '/*');
                                        rstream.on('end', callback);
                                        rstream.pipe(new RangedStream(min, max)).pipe(ctx.response);
                                    }
                                    else {
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                        ctx.response.setHeader('Accept-Ranges', 'bytes');
                                        ctx.response.setHeader('Content-Type', mimeType);
                                        if (size !== null && size !== undefined && size > -1)
                                            ctx.response.setHeader('Content-Length', size.toString());
                                        rstream.on('end', callback);
                                        rstream.pipe(ctx.response);
                                    }
                                });
                            }); });
                        }); });
                    });
                    //})
                });
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return type && type.isFile;
    };
    return default_1;
}());
exports.default = default_1;
