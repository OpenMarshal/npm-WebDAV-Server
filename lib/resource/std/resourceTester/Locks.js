"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getLocks(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        r1.getLocks(function (e, locks) {
            callback(e, !e, 'getLocks error', _this.options.canGetLocks, function () {
                callback(null, !!locks && !!locks.prototype[Symbol.iterator], 'getLocks returns an invalid value : must be an iterable', _this.options.canWrite);
            });
        });
    });
}
exports.getLocks = getLocks;
function setLock(callback) {
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
exports.setLock = setLock;
function removeLock(callback) {
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
exports.removeLock = removeLock;
function getAvailableLocks(callback) {
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
exports.getAvailableLocks = getAvailableLocks;
function getLock(callback) {
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
exports.getLock = getLock;
