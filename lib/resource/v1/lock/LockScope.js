"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope = /** @class */ (function () {
    function LockScope(value) {
        this.value = value;
    }
    LockScope.prototype.toString = function () {
        return this.value;
    };
    LockScope.prototype.isSame = function (scope) {
        return scope.value.toLowerCase() === this.value.toLowerCase();
    };
    LockScope.Shared = new LockScope('shared');
    LockScope.Exclusive = new LockScope('exclusive');
    return LockScope;
}());
exports.LockScope = LockScope;
