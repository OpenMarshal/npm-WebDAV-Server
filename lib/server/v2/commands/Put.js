"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Errors_1 = require("../../../Errors");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.isValidFor = function (ctx, type) {
        return !type || type.isFile;
    };
    default_1.prototype.chunked = function (ctx, inputStream, callback) {
        var targetSource = ctx.headers.isSource;
        ctx.getResource(function (e, r) {
            ctx.checkIfHeader(r, function () {
                //ctx.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                var mode = 'canCreate';
                r.type(function (e, type) { return process.nextTick(function () {
                    if (e === Errors_1.Errors.ResourceNotFound) {
                        mode = 'mustCreate';
                    }
                    else if (e) {
                        if (!ctx.setCodeFromError(e))
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        return callback();
                    }
                    else if (!type.isFile) {
                        ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                        return callback();
                    }
                    r.openWriteStream(mode, targetSource, ctx.headers.contentLength, function (e, wStream, created) {
                        if (e) {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(e === Errors_1.Errors.IntermediateResourceMissing || e === Errors_1.Errors.WrongParentTypeForCreation ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return callback();
                        }
                        inputStream.pipe(wStream);
                        wStream.on('finish', function (e) {
                            if (created)
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.Created);
                            else
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            //ctx.invokeEvent('write', r);
                            callback();
                        });
                        wStream.on('error', function (e) {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        });
                    });
                }); });
                //})
            });
        });
    };
    return default_1;
}());
exports.default = default_1;
