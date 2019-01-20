"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Move_1 = require("./Move");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        Move_1.execute(ctx, 'copy', 'canCopy', callback);
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
