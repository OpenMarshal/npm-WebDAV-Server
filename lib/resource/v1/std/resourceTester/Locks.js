"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("../../lock/LockScope");
var LockKind_1 = require("../../lock/LockKind");
var LockType_1 = require("../../lock/LockType");
var Lock_1 = require("../../lock/Lock");
// ****************************** Locks ****************************** //
function lock(callback) {
    var _this = this;
    if (!this.options.canLock) {
        callback = this.multiple(callback, 5);
        var lock_1 = new Lock_1.Lock(new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write), '123', null);
        this.producer(false, function (r1) { return r1.getLock('123', function (e) { return callback(e, !e, 'getLock must return an error', false); }); });
        this.producer(false, function (r1) { return r1.setLock(lock_1, function (e) { return callback(e, !e, 'setLock must return an error', false); }); });
        this.producer(false, function (r1) { return r1.getAvailableLocks(function (e, kinds) { return callback(e, !e, 'getAvailableLocks must return an error', false); }); });
        this.producer(false, function (r1) { return r1.getLocks(function (e, locks) { return callback(e, !e, 'getLocks must return an error', false); }); });
        this.producer(false, function (r1) { return r1.removeLock('123', function (e, removed) { return callback(e, !e, 'removeLock must return an error', false); }); });
        return;
    }
    callback = this.multiple(callback, 2);
    var lock1 = new Lock_1.Lock(new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write), '123', null);
    this.producer(false, function (r1) {
        r1.setLock(lock1, function (e) {
            callback(e, !e, 'setLock error', undefined, function () {
                r1.getLock(lock1.uuid, function (e, lock) {
                    callback(e, !e, 'getLock error - cannot find the lock', undefined, function () {
                        callback(null, lock && lock.isSame && lock.isSame(lock1), 'The lock returned by getLock is not the one stored previously by setLock', undefined, function () {
                            r1.getLocks(function (e, locks) {
                                callback(e, !e, 'getLocks error', undefined, function () {
                                    callback(null, locks && locks.length === 1 && locks[0].isSame && locks[0].isSame(lock1), 'The lock added is not listed in the result of getLocks', undefined, function () {
                                        r1.removeLock(lock1.uuid, function (e, removed) {
                                            callback(e, !e && removed, 'removeLock error', undefined, function () {
                                                r1.getLocks(function (e, locks) {
                                                    callback(e, !e, 'getLocks error', undefined, function () {
                                                        callback(null, locks && locks.length === 0, 'The lock has not really been removed');
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    this.producer(false, function (r1) {
        r1.getAvailableLocks(function (e, locks) {
            callback(e, !e, 'getAvailableLocks error', _this.options.canLock, function () {
                callback(null, !!locks && !!locks.constructor.prototype[Symbol.iterator], 'getAvailableLocks returns an invalid value : must be an iterable', _this.options.canLock);
            });
        });
    });
}
exports.lock = lock;
