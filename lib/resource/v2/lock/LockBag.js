"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("./LockScope");
var LockBag = /** @class */ (function () {
    function LockBag() {
        this.locks = [];
    }
    LockBag.prototype.getLocks = function (lockType) {
        this.cleanLocks();
        var locks = this.locks;
        if (lockType)
            locks = locks.filter(function (lock) { return lock.lockKind.type.isSame(lockType); });
        return locks;
    };
    LockBag.prototype.getLock = function (uuid) {
        for (var _i = 0, _a = this.locks; _i < _a.length; _i++) {
            var lock = _a[_i];
            if (lock.uuid === uuid)
                return lock;
        }
        return null;
    };
    LockBag.prototype.setLock = function (lock) {
        var canLock = this.canLock(lock.lockKind);
        if (canLock)
            this.locks.push(lock);
        return canLock;
    };
    LockBag.prototype.removeLock = function (uuid) {
        var _this = this;
        this.locks = this.locks.filter(function (lock) { return _this.notExpired(lock) && lock.uuid !== uuid; });
    };
    LockBag.prototype.canLock = function (lockKind) {
        this.cleanLocks();
        return !(lockKind.scope.isSame(LockScope_1.LockScope.Exclusive) && this.locks.length > 0)
            && !this.locks.some(function (l) { return l.lockKind.scope.isSame(LockScope_1.LockScope.Exclusive); });
    };
    LockBag.prototype.notExpired = function (lock) {
        return !lock.expired();
    };
    LockBag.prototype.cleanLocks = function () {
        this.locks = this.locks.filter(this.notExpired);
    };
    return LockBag;
}());
exports.LockBag = LockBag;
