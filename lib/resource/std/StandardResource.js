"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("../lock/LockScope");
var Workflow_1 = require("../../helper/Workflow");
var LockType_1 = require("../lock/LockType");
var LockKind_1 = require("../lock/LockKind");
var LockBag_1 = require("../lock/LockBag");
var Errors_1 = require("../../Errors");
var StandardResource = (function () {
    function StandardResource(parent, fsManager) {
        this.dateCreation = Date.now();
        this.properties = {};
        this.fsManager = fsManager;
        this.lockBag = new LockBag_1.LockBag();
        this.parent = parent;
        this.dateLastModified = this.dateCreation;
    }
    StandardResource.sizeOfSubFiles = function (resource, targetSource, callback) {
        resource.getChildren(function (e, children) {
            if (e) {
                callback(e, null);
                return;
            }
            new Workflow_1.Workflow()
                .each(children, function (child, cb) {
                child.size(targetSource, cb);
            })
                .error(function (e) { return callback(e, 0); })
                .done(function (sizes) { return callback(null, sizes.reduce(function (o, s) { return o + s; }, 0)); });
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
        callback(locked ? null : Errors_1.Errors.CannotLockResource);
    };
    StandardResource.prototype.removeLock = function (uuid, callback) {
        this.lockBag.removeLock(uuid);
        this.updateLastModified();
        callback(null, true);
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
            callback(Errors_1.Errors.PropertyNotFound, null);
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
        StandardResource.standardRemoveFromParent(this, callback);
    };
    StandardResource.standardRemoveFromParent = function (resource, callback) {
        var parent = resource.parent;
        if (parent)
            parent.removeChild(resource, function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                if (resource.parent === parent)
                    resource.parent = null;
                callback(null);
            });
        else
            callback(null);
    };
    StandardResource.standardMoveTo = function (resource, parent, newName, overwrite, setName, callback) {
        if (parent === resource.parent) {
            resource.rename(newName, function (e, oldName, newName) {
                callback(e);
            });
            return;
        }
        StandardResource.standardRemoveFromParent(resource, function (e) {
            if (e) {
                callback(e);
            }
            else {
                setName(newName);
                parent.addChild(resource, function (e) {
                    callback(e);
                });
            }
        });
    };
    return StandardResource;
}());
exports.StandardResource = StandardResource;
