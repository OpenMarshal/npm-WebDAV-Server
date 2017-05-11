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
var Lock = (function () {
    function Lock(lockKind, owner) {
        this.expirationDate = Date.now() + lockKind.timeout;
        this.lockKind = lockKind;
        this.owner = owner;
        this.uuid = Lock.generateUUID(this.expirationDate);
    }
    Lock.generateUUID = function (expirationDate) {
        var rnd1 = Math.ceil(Math.random() * 0x3FFF) + 0x8000;
        var rnd2 = Math.ceil(Math.random() * 0xFFFFFFFF);
        function pad(value, nb) {
            var str = Math.ceil(value).toString(16);
            while (str.length < nb)
                str = '0' + str;
            return str;
        }
        var uuid = 'urn:uuid:';
        uuid += pad(expirationDate & 0xFFFFFFFF, 8);
        uuid += '-' + pad((expirationDate >> 32) & 0xFFFF, 4);
        uuid += '-' + pad(((expirationDate >> (32 + 16)) & 0x0FFF) + 0x1000, 4);
        uuid += '-' + pad((rnd1 >> 16) & 0xFF, 2);
        uuid += pad(rnd1 & 0xFF, 2);
        uuid += '-' + pad(rnd2, 12);
        return uuid;
    };
    Lock.prototype.expired = function () {
        return Date.now() > this.expirationDate;
    };
    return Lock;
}());
exports.Lock = Lock;
var LockBag = (function () {
    function LockBag() {
    }
    LockBag.prototype.notExpired = function (l) {
        return !l.expired();
    };
    LockBag.prototype.cleanLocks = function () {
        this.locks = this.locks.filter(this.notExpired);
    };
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
            return l.lockKind.scope === LockScope.Exclusive;
        });
    };
    return LockBag;
}());
exports.LockBag = LockBag;
