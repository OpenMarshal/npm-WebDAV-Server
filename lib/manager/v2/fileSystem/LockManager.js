"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalLockManager = /** @class */ (function () {
    function LocalLockManager(serializedData) {
        this.locks = [];
        if (serializedData)
            for (var name_1 in serializedData)
                this[name_1] = serializedData[name_1];
    }
    LocalLockManager.prototype.getLocks = function (callback) {
        this.locks = this.locks.filter(function (lock) { return !lock.expired(); });
        callback(null, this.locks);
    };
    LocalLockManager.prototype.setLock = function (lock, callback) {
        this.locks.push(lock);
        callback(null);
    };
    LocalLockManager.prototype.removeLock = function (uuid, callback) {
        for (var index = 0; index < this.locks.length; ++index)
            if (this.locks[index].uuid === uuid) {
                this.locks.splice(index, 1);
                return callback(null, true);
            }
        callback(null, false);
    };
    LocalLockManager.prototype.getLock = function (uuid, callback) {
        this.locks = this.locks.filter(function (lock) { return !lock.expired(); });
        for (var _i = 0, _a = this.locks; _i < _a.length; _i++) {
            var lock = _a[_i];
            if (lock.uuid === uuid)
                return callback(null, lock);
        }
        callback();
    };
    LocalLockManager.prototype.refresh = function (uuid, timeoutSeconds, callback) {
        this.getLock(uuid, function (e, lock) {
            if (e || !lock)
                return callback(e);
            lock.refresh(timeoutSeconds);
            callback(null, lock);
        });
    };
    return LocalLockManager;
}());
exports.LocalLockManager = LocalLockManager;
