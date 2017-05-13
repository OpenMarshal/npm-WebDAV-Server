"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope = (function () {
    function LockScope(value) {
        this.value = value;
    }
    LockScope.prototype.toString = function () {
        return this.value;
    };
    return LockScope;
}());
LockScope.Shared = new LockScope('shared');
LockScope.Exclusive = new LockScope('exclusive');
exports.LockScope = LockScope;
