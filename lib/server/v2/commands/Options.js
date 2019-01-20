"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
            callback();
        });
    };
    return default_1;
}());
exports.default = default_1;
