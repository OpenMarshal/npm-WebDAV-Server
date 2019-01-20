"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var CommonTypes_1 = require("../../../manager/v2/fileSystem/CommonTypes");
var Errors_1 = require("../../../Errors");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.checkIfHeader(undefined, function () {
                ctx.getResource(function (e, r) {
                    ctx.getResource(ctx.requested.path.getParent(), function (e, rParent) {
                        rParent.type(function (e, parentType) {
                            if (e) {
                                if (e === Errors_1.Errors.ResourceNotFound)
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                                else if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                return callback();
                            }
                            if (!parentType.isDirectory) {
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                                return callback();
                            }
                            r.create(CommonTypes_1.ResourceType.Directory, function (e) {
                                if (e) {
                                    if (e === Errors_1.Errors.ResourceAlreadyExists)
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                                    else if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                }
                                else
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                callback();
                            });
                        });
                    });
                });
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return !type;
    };
    return default_1;
}());
exports.default = default_1;
