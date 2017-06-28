"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var default_1 = (function () {
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
                            r.size(targetSource, function (e, size) {
                                if (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                }
                                else {
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                    ctx.response.setHeader('Accept-Ranges', 'bytes');
                                    ctx.response.setHeader('Content-Type', mimeType);
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
    default_1.prototype.isValidFor = function (type) {
        return type && type.isFile;
    };
    return default_1;
}());
exports.default = default_1;
