"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockType = /** @class */ (function () {
    function LockType(value) {
        this.value = value;
    }
    LockType.prototype.toString = function () {
        return this.value;
    };
    LockType.prototype.isSame = function (scope) {
        return scope.value.toLowerCase() === this.value.toLowerCase();
    };
    LockType.Write = new LockType('write');
    return LockType;
}());
exports.LockType = LockType;
