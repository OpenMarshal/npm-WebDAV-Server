"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lock_1 = require("./Lock");
var StandardResource = (function () {
    function StandardResource(parent, fsManager) {
        this.dateCreation = Date.now();
        this.properties = new Object();
        this.fsManager = fsManager;
        this.lockBag = new Lock_1.LockBag();
        this.parent = parent;
        this.dateLastModified = this.dateCreation;
    }
    StandardResource.prototype.updateLastModified = function () {
        this.dateLastModified = Date.now();
    };
    StandardResource.prototype.removeFromParent = function (callback) {
        if (this.parent)
            this.parent.removeChild(this, callback);
        else
            callback(null);
    };
    StandardResource.prototype.isSame = function (resource, callback) {
        callback(null, resource === this);
    };
    StandardResource.prototype.isOnTheSameFSWith = function (resource, callback) {
        callback(null, resource.fsManager === this.fsManager);
    };
    StandardResource.prototype.getAvailableLocks = function (callback) {
        callback(null, [
            new Lock_1.LockKind(Lock_1.LockScope.Esclusive, Lock_1.LockType.Write),
            new Lock_1.LockKind(Lock_1.LockScope.Shared, Lock_1.LockType.Write)
        ]);
    };
    StandardResource.prototype.getLocks = function (lockKind, callback) {
        callback(null, this.lockBag.getLocks(lockKind));
    };
    StandardResource.prototype.setLock = function (lock, callback) {
        var locked = this.lockBag.setLock(lock);
        callback(locked ? null : new Error('Can\'t lock the resource.'));
    };
    StandardResource.prototype.removeLock = function (uuid, owner, callback) {
        this.getChildren(function (e, children) {
            if (e) {
                callback(e, false);
                return;
            }
            var nb = children.length + 1;
            children.forEach(function (child) {
                child.canRemoveLock(uuid, owner, go);
            });
            go(null, true);
            function go(e, can) {
                if (e) {
                    nb = -1;
                    callback(e, false);
                    return;
                }
                if (!can) {
                    nb = -1;
                    callback(null, false);
                    return;
                }
                --nb;
                if (nb === 0) {
                    this.lockBag.removeLock(uuid, owner);
                    this.updateLastModified();
                    callback(null, true);
                }
            }
        });
    };
    StandardResource.prototype.canRemoveLock = function (uuid, owner, callback) {
        callback(null, this.lockBag.canRemoveLock(uuid, owner));
    };
    StandardResource.prototype.canLock = function (lockKind, callback) {
        callback(null, this.lockBag.canLock(lockKind));
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
    StandardResource.prototype.creationDate = function (callback) {
        callback(null, this.dateCreation);
    };
    StandardResource.prototype.lastModifiedDate = function (callback) {
        callback(null, this.dateLastModified);
    };
    return StandardResource;
}());
exports.StandardResource = StandardResource;
