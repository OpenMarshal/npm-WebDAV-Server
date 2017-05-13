"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockType = (function () {
    function LockType(value) {
        this.value = value;
    }
    LockType.prototype.toString = function () {
        return this.value;
    };
    return LockType;
}());
LockType.Write = new LockType('write');
exports.LockType = LockType;
