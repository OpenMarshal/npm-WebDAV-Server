"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Get_1 = require("./Get");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.getResource(function (e, r) {
                var targetSource = ctx.headers.isSource;
                ctx.checkIfHeader(r, function () {
                    //ctx.requirePrivilege(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], r, () => {
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
                        r.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                            if (e) {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                return callback();
                            }
                            var range = ctx.headers.find('Range');
                            r.size(targetSource, function (e, size) {
                                if (e && !range) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                }
                                else if (range) {
                                    try {
                                        var _a = Get_1.parseRangeHeader(mimeType, size, range), ranges = _a.ranges, separator = _a.separator, len = _a.len;
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.PartialContent);
                                        ctx.response.setHeader('Accept-Ranges', 'bytes');
                                        ctx.response.setHeader('Content-Length', len.toString());
                                        if (ranges.length <= 1) {
                                            ctx.response.setHeader('Content-Type', mimeType);
                                            ctx.response.setHeader('Content-Range', "bytes " + ranges[0].min + "-" + ranges[0].max + "/*");
                                        }
                                        else
                                            ctx.response.setHeader('Content-Type', "multipart/byteranges; boundary=" + separator);
                                    }
                                    catch (ex) {
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                                        callback();
                                    }
                                }
                                else {
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                    ctx.response.setHeader('Accept-Ranges', 'bytes');
                                    ctx.response.setHeader('Content-Type', mimeType);
                                    if (size !== null && size !== undefined && size > -1)
                                        ctx.response.setHeader('Content-Length', size.toString());
                                }
                                callback();
                            });
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
