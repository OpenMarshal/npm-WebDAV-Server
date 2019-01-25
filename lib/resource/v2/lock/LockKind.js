"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockKind = /** @class */ (function () {
    function LockKind(scope, type, timeoutSeconds) {
        if (timeoutSeconds === void 0) { timeoutSeconds = 60; }
        this.timeout = timeoutSeconds;
        this.scope = scope;
        this.type = type;
    }
    LockKind.prototype.isSimilar = function (lockKind) {
        return this.scope.isSame(lockKind.scope) && this.type.isSame(lockKind.type);
    };
    return LockKind;
}());
exports.LockKind = LockKind;
