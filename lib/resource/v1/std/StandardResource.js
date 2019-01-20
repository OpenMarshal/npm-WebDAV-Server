"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockScope_1 = require("../lock/LockScope");
var Workflow_1 = require("../../../helper/Workflow");
var LockType_1 = require("../lock/LockType");
var LockKind_1 = require("../lock/LockKind");
var LockBag_1 = require("../lock/LockBag");
var Errors_1 = require("../../../Errors");
var mimeTypes = require("mime-types");
var StandardResource = /** @class */ (function () {
    function StandardResource(parent, fsManager) {
        this.deleteOnMoved = true;
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
    // ****************************** Locks ****************************** //
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
    // ****************************** Properties ****************************** //
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
    StandardResource.prototype.moveTo = function (parent, newName, overwrite, callback) {
        StandardResource.standardMoveByCopy(this, parent, newName, overwrite, this.deleteOnMoved, callback);
    };
    // ****************************** Std meta-data ****************************** //
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
    StandardResource.prototype.addToParent = function (parent, callback) {
        StandardResource.standardAddToParent(this, parent, callback);
    };
    StandardResource.standardRemoveFromParent = function (resource, callback) {
        var parent = resource.parent;
        if (parent)
            parent.removeChild(resource, function (e) {
                if (!e && resource.parent === parent) // resource.parent didn't change
                    resource.parent = null;
                callback(e);
            });
        else
            callback(null);
    };
    StandardResource.standardAddToParent = function (resource, parent, callback) {
        parent.addChild(resource, function (e) {
            if (!e)
                resource.parent = parent;
            callback(e);
        });
    };
    StandardResource.standardFindChildren = function (parent, predicate, callback) {
        parent.getChildren(function (e, children) {
            if (e) {
                callback(e, null);
                return;
            }
            new Workflow_1.Workflow()
                .each(children, function (child, cb) {
                predicate(child, function (e, isMatching) { return cb(e, isMatching ? child : null); });
            })
                .error(function (e) { return callback(e, null); })
                .done(function (conflictingChildren) { return callback(null, conflictingChildren.filter(function (c) { return !!c; })); });
        });
    };
    StandardResource.standardFindChildByName = function (parent, name, callback) {
        this.standardFindChildren(parent, function (r, cb) { return r.webName(function (e, rname) {
            if (e)
                cb(e);
            else if (name === rname)
                cb(null, true);
            else
                cb(null, false);
        }); }, function (e, rs) {
            if (e)
                callback(e, null);
            else if (rs.length > 0)
                callback(null, rs[0]);
            else
                callback(Errors_1.Errors.ResourceNotFound, null);
        });
    };
    StandardResource.standardMoveByCopy = function (resource, parent, newName, overwrite, deleteSource, callback) {
        StandardResource.standardFindChildByName(parent, newName, function (e, r) {
            if (e === Errors_1.Errors.ResourceNotFound)
                copy();
            else if (e)
                callback(e, null);
            else if (!overwrite)
                callback(Errors_1.Errors.ResourceAlreadyExists, null);
            else
                r.delete(function (e) {
                    if (e)
                        callback(e, null);
                    else
                        copy();
                });
        });
        function copy() {
            resource.type(function (e, type) {
                if (e) {
                    callback(e, null);
                    return;
                }
                var destination = parent.fsManager.newResource(null, newName, type, parent);
                destination.create(function (e) {
                    if (e) {
                        callback(e, null);
                        return;
                    }
                    parent.addChild(destination, function (e) {
                        if (e) {
                            callback(e, null);
                            return;
                        }
                        if (type.isDirectory)
                            copyDir(destination);
                        else
                            copyFile(destination);
                    });
                });
            });
        }
        function copyProperties(destination, callback) {
            resource.getProperties(function (e, props) {
                if (e) {
                    callback(e);
                    return;
                }
                new Workflow_1.Workflow()
                    .each(Object.keys(props), function (key, cb) { return destination.setProperty(key, props[key], cb); })
                    .error(callback)
                    .done(function () { return callback(null); });
            });
        }
        function copyLocks(destination, callback) {
            resource.getLocks(function (e, locks) {
                if (e === Errors_1.Errors.MustIgnore) {
                    callback(null);
                    return;
                }
                if (e) {
                    callback(e);
                    return;
                }
                new Workflow_1.Workflow()
                    .each(locks, function (lock, cb) { return destination.setLock(lock, cb); })
                    .error(callback)
                    .done(function () { return callback(null); });
            });
        }
        function finalizeCopy(destination) {
            copyProperties(destination, function (e) {
                if (e)
                    callback(e, null);
                else
                    copyLocks(destination, function (e) {
                        if (e)
                            callback(e, null);
                        else if (deleteSource)
                            resource.delete(function (e) { return callback(e, destination); });
                        else
                            resource.parent.removeChild(resource, function (e) { return callback(e, destination); });
                    });
            });
        }
        function copyDir(destination) {
            resource.getChildren(function (e, children) {
                if (e) {
                    callback(e, null);
                    return;
                }
                new Workflow_1.Workflow()
                    .each(children, function (child, cb) { return child.webName(function (e, name) {
                    if (e)
                        cb(e);
                    else
                        child.moveTo(destination, name, overwrite, cb);
                }); })
                    .error(function (e) { return callback(e, null); })
                    .done(function () { return finalizeCopy(destination); });
            });
        }
        function copyFile(destination) {
            resource.read(true, function (e, rStream) {
                if (e) {
                    callback(e, null);
                    return;
                }
                destination.write(true, function (e, wStream) {
                    if (e) {
                        callback(e, null);
                        return;
                    }
                    rStream.pipe(wStream);
                    wStream.on('error', callback);
                    wStream.on('finish', function () { return finalizeCopy(destination); });
                });
            });
        }
    };
    StandardResource.standardMoveTo = function (resource, parent, newName, overwrite, callback) {
        StandardResource.standardMoveByCopy(resource, parent, newName, overwrite, true, callback);
    };
    /**
     * @deprecated Prefer calling 'standardMoveByCopy(...)' instead to avoid compatibility issue between file systems.
     */
    StandardResource.standardMoveWithoutCopy = function (resource, parent, newName, overwrite, callback) {
        StandardResource.standardFindChildByName(parent, newName, function (e, r) {
            if (e === Errors_1.Errors.ResourceNotFound)
                move();
            else if (e)
                callback(e);
            else if (!overwrite)
                callback(Errors_1.Errors.ResourceAlreadyExists);
            else
                r.delete(function (e) {
                    if (e)
                        callback(e);
                    else
                        move();
                });
        });
        function move() {
            if (parent === resource.parent) {
                resource.rename(newName, function (e, oldName, newName) {
                    callback(e);
                });
                return;
            }
            StandardResource.standardRemoveFromParent(resource, function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                resource.webName(function (e, name) {
                    if (e || name === newName) {
                        parent.addChild(resource, function (e) {
                            callback(e);
                        });
                        return;
                    }
                    resource.rename(newName, function (e, oldName, newName) {
                        if (e)
                            callback(e);
                        else
                            parent.addChild(resource, function (e) {
                                callback(e);
                            });
                    });
                });
            });
        }
    };
    StandardResource.standardMimeType = function (resource, targetSource, _defaultMimeType, _useWebName, _callback) {
        var callback;
        var useWebName = false;
        var defaultMimeType = 'application/octet-stream';
        if (_defaultMimeType.constructor === Function) {
            callback = _defaultMimeType;
        }
        else if (_defaultMimeType.constructor === Boolean) {
            callback = _useWebName;
            if (_defaultMimeType !== undefined && _defaultMimeType !== null)
                useWebName = _defaultMimeType;
        }
        else {
            callback = _callback;
            if (_useWebName !== undefined && _useWebName !== null)
                useWebName = _useWebName;
            if (_defaultMimeType !== undefined && _defaultMimeType !== null)
                defaultMimeType = _defaultMimeType;
        }
        resource.type(function (e, type) {
            if (e)
                callback(e, null);
            else if (type.isFile) {
                var fn = !useWebName && resource.displayName ? resource.displayName : resource.webName;
                fn(function (e, name) {
                    if (e)
                        callback(e, null);
                    else {
                        var mt = mimeTypes.contentType(name);
                        callback(null, mt ? mt : defaultMimeType);
                    }
                });
            }
            else
                callback(Errors_1.Errors.NoMimeTypeForAFolder, null);
        });
    };
    return StandardResource;
}());
exports.StandardResource = StandardResource;
