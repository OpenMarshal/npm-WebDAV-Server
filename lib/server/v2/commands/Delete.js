"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.getResource(function (e, r) {
                ctx.checkIfHeader(r, function () {
                    //ctx.requirePrivilege([ 'canDelete' ], r, () => {
                    r.delete(function (e) { return process.nextTick(function () {
                        if (e) {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        }
                        else {
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            //ctx.invokeEvent('delete', r);
                        }
                        callback();
                    }); });
                    //})
                });
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
