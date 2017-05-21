"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("../lock/LockScope");
var LockType_1 = require("../lock/LockType");
var LockKind_1 = require("../lock/LockKind");
var LockBag_1 = require("../lock/LockBag");
var StandardResource = (function () {
    function StandardResource(parent, fsManager) {
        this.dateCreation = Date.now();
        this.properties = {};
        this.fsManager = fsManager;
        this.lockBag = new LockBag_1.LockBag();
        this.parent = parent;
        this.dateLastModified = this.dateCreation;
    }
    StandardResource.sizeOfSubFiles = function (resource, callback) {
        resource.getChildren(function (e, children) {
            if (e) {
                callback(e, null);
                return;
            }
            if (children.length === 0) {
                callback(null, 0);
                return;
            }
            var size = 0;
            var nb = children.length;
            function go(e, s) {
                if (nb <= 0)
                    return;
                if (e) {
                    nb = -1;
                    callback(e, size);
                    return;
                }
                size += s;
                --nb;
                if (nb === 0)
                    callback(null, size);
            }
            children.forEach(function (c) { return c.size(go); });
        });
    };
    StandardResource.prototype.isSame = function (resource, callback) {
        callback(null, resource === this);
    };
    StandardResource.prototype.isOnTheSameFSWith = function (resource, callback) {
        callback(null, resource.fsManager === this.fsManager);
    };
    StandardResource.prototype.getAvailableLocks = function (callback) {
        callback(null, [
            new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write),
            new LockKind_1.LockKind(LockScope_1.LockScope.Shared, LockType_1.LockType.Write)
        ]);
    };
    StandardResource.prototype.getLocks = function (callback) {
        callback(null, this.lockBag.getLocks());
    };
    StandardResource.prototype.setLock = function (lock, callback) {
        var locked = this.lockBag.setLock(lock);
        this.updateLastModified();
        callback(locked ? null : new Error('Can\'t lock the resource.'));
    };
    StandardResource.prototype.removeLock = function (uuid, callback) {
        this.lockBag.removeLock(uuid);
        this.updateLastModified();
        callback(null, true);
    };
    StandardResource.prototype.canRemoveLock = function (uuid, callback) {
        callback(null, this.lockBag.canRemoveLock(uuid));
    };
    StandardResource.prototype.canLock = function (lockKind, callback) {
        callback(null, this.lockBag.canLock(lockKind));
    };
    StandardResource.prototype.getLock = function (uuid, callback) {
        callback(null, this.lockBag.getLock(uuid));
    };
    StandardResource.prototype.setProperty = function (name, value, callback) {
        this.properties[name] = value;
        this.updateLastModified();
        callback(null);
    };
    StandardResource.prototype.getProperty = function (name, callback) {
        var value = this.properties[name];
        if (value === undefined)
            callback(new Error('No property with such name.'), null);
        else
            callback(null, value);
    };
    StandardResource.prototype.removeProperty = function (name, callback) {
        delete this.properties[name];
        this.updateLastModified();
        callback(null);
    };
    StandardResource.prototype.getProperties = function (callback) {
        callback(null, this.properties);
    };
    StandardResource.prototype.creationDate = function (callback) {
        callback(null, this.dateCreation);
    };
    StandardResource.prototype.lastModifiedDate = function (callback) {
        callback(null, this.dateLastModified);
    };
    StandardResource.prototype.updateLastModified = function () {
        this.dateLastModified = Date.now();
    };
    StandardResource.prototype.removeFromParent = function (callback) {
        var _this = this;
        var parent = this.parent;
        if (parent)
            parent.removeChild(this, function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                if (_this.parent === parent)
                    _this.parent = null;
                callback(null);
            });
        else
            callback(null);
    };
    return StandardResource;
}());
exports.StandardResource = StandardResource;
