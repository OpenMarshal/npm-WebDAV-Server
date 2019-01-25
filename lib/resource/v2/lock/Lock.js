"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lock = /** @class */ (function () {
    function Lock(lockKind, user, owner, depth) {
        this.expirationDate = Date.now() + lockKind.timeout * 1000;
        this.lockKind = lockKind;
        this.owner = owner;
        this.depth = depth === undefined || depth === null ? -1 : depth;
        this.uuid = Lock.generateUUID(this.expirationDate);
        this.userUid = user ? user.constructor === String ? user : user.uid : null;
    }
    Lock.generateUUID = function (expirationDate) {
        var rnd1 = Math.ceil(Math.random() * 0x3FFF) + 0x8000;
        var rnd2 = Math.ceil(Math.random() * 0xFFFFFFFF);
        function pad(value, nb) {
            if (value < 0)
                value *= -1;
            var str = Math.ceil(value).toString(16);
            while (str.length < nb)
                str = '0' + str;
            return str;
        }
        var uuid = 'urn:uuid:';
        // time_low
        uuid += pad(expirationDate & 0xFFFFFFFF, 8);
        // time_mid
        uuid += '-' + pad((expirationDate >> 32) & 0xFFFF, 4);
        // time_hi_and_version
        uuid += '-' + pad(((expirationDate >> (32 + 16)) & 0x0FFF) + 0x1000, 4);
        // clock_seq_hi_and_reserved
        uuid += '-' + pad((rnd1 >> 16) & 0xFF, 2);
        // clock_seq_low
        uuid += pad(rnd1 & 0xFF, 2);
        // node
        uuid += '-' + pad(rnd2, 12);
        return uuid;
    };
    Lock.prototype.isSame = function (lock) {
        return this.uuid === lock.uuid && this.userUid === lock.userUid && this.expirationDate === lock.expirationDate && this.lockKind.isSimilar(lock.lockKind);
    };
    Lock.prototype.expired = function () {
        return Date.now() > this.expirationDate;
    };
    Lock.prototype.refresh = function (timeoutSeconds) {
        timeoutSeconds = timeoutSeconds || this.lockKind.timeout;
        this.expirationDate = Date.now() + timeoutSeconds * 1000;
    };
    return Lock;
}());
exports.Lock = Lock;
