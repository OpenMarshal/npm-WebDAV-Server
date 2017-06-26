"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var CommonTypes_1 = require("../../../manager/v2/fileSystem/CommonTypes");
var Errors_1 = require("../../../Errors");
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.checkIfHeader(undefined, function () {
                ctx.getResource(function (e, r) {
                    ctx.getResource(r.path.getParent(), function (e, rParent) {
                        rParent.type(function (e, parentType) {
                            if (e) {
                                ctx.setCode(e === Errors_1.Errors.ResourceNotFound ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            if (!parentType.isDirectory) {
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                                callback();
                                return;
                            }
                            r.create(CommonTypes_1.ResourceType.Directory, function (e) {
                                if (e) {
                                    if (e === Errors_1.Errors.WrongParentTypeForCreation)
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                                    else if (e === Errors_1.Errors.ResourceAlreadyExists)
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                                    else
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
    default_1.prototype.isValidFor = function (type) {
        return !type;
    };
    return default_1;
}());
exports.default = default_1;
