"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("./LockScope");
var LockBag = (function () {
    function LockBag() {
        this.locks = [];
    }
    LockBag.prototype.getLocks = function (lockKind) {
        this.cleanLocks();
        return this.locks.filter(function (l) { return l.lockKind.isSimilar(lockKind); });
    };
    LockBag.prototype.setLock = function (lock) {
        if (!this.canLock(lock.lockKind))
            return false;
        this.locks.push(lock);
        return true;
    };
    LockBag.prototype.removeLock = function (uuid, owner) {
        var _this = this;
        this.locks = this.locks.filter(function (l) { return _this.notExpired(l) && (l.uuid !== uuid || l.owner !== owner); });
    };
    LockBag.prototype.canRemoveLock = function (uuid, owner) {
        this.cleanLocks();
        return this.locks.some(function (l) { return l.uuid === uuid && l.owner !== owner; });
    };
    LockBag.prototype.canLock = function (lockKind) {
        this.cleanLocks();
        return !this.locks.some(function (l) {
            return l.lockKind.scope === LockScope_1.LockScope.Exclusive;
        });
    };
    LockBag.prototype.notExpired = function (l) {
        return !l.expired();
    };
    LockBag.prototype.cleanLocks = function () {
        this.locks = this.locks.filter(this.notExpired);
    };
    return LockBag;
}());
exports.LockBag = LockBag;
