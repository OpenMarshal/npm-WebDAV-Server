"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockKind = (function () {
    function LockKind(scope, type, timeout) {
        if (timeout === void 0) { timeout = 60; }
        this.scope = scope;
        this.type = type;
        this.timeout = timeout;
    }
    LockKind.prototype.isSimilar = function (lockKind) {
        return this.scope === lockKind.scope && this.type === lockKind.type;
    };
    return LockKind;
}());
exports.LockKind = LockKind;
