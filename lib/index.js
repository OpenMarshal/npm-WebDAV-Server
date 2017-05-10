"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var LockType;
(function (LockType) {
    LockType[LockType["Write"] = 0] = "Write";
})(LockType = exports.LockType || (exports.LockType = {}));
var LockScope;
(function (LockScope) {
    LockScope[LockScope["Shared"] = 0] = "Shared";
    LockScope[LockScope["Esclusive"] = 1] = "Esclusive";
})(LockScope = exports.LockScope || (exports.LockScope = {}));
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
var FSPath = (function () {
    function FSPath() {
    }
    return FSPath;
}());
exports.FSPath = FSPath;
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
            return l.lockKind.scope === LockScope.Esclusive;
        });
    };
    return LockBag;
}());
exports.LockBag = LockBag;
function forAll(array, itemFn, onAllAndSuccess, onError) {
    var nb = array.length + 1;
    var error = null;
    array.forEach(function (child) {
        if (error)
            return;
        itemFn(child, function (e) {
            if (e) {
                error = e;
                onError(error);
            }
            else
                go();
        });
    });
    go();
    function go() {
        --nb;
        if (nb === 0 || error)
            return;
        onAllAndSuccess();
    }
}
var path = require("path");
var fs = require("fs");
var StdandardResource = (function () {
    function StdandardResource(parent, fsManager) {
        this.dateCreation = Date.now();
        this.properties = new Object();
        this.fsManager = fsManager;
        this.lockBag = new LockBag();
        this.parent = parent;
        this.dateLastModified = this.dateCreation;
    }
    StdandardResource.prototype.updateLastModified = function () {
        this.dateLastModified = Date.now();
    };
    StdandardResource.prototype.removeFromParent = function (callback) {
        if (this.parent)
            this.parent.removeChild(this, callback);
        else
            callback(null);
    };
    StdandardResource.prototype.isSame = function (resource, callback) {
        callback(null, resource === this);
    };
    StdandardResource.prototype.isOnTheSameFSWith = function (resource, callback) {
        callback(null, resource.fsManager === this.fsManager);
    };
    StdandardResource.prototype.getAvailableLocks = function (callback) {
        callback(null, [
            new LockKind(LockScope.Esclusive, LockType.Write),
            new LockKind(LockScope.Shared, LockType.Write)
        ]);
    };
    StdandardResource.prototype.getLocks = function (lockKind, callback) {
        callback(null, this.lockBag.getLocks(lockKind));
    };
    StdandardResource.prototype.setLock = function (lock, callback) {
        var locked = this.lockBag.setLock(lock);
        callback(locked ? null : new Error('Can\'t lock the resource.'));
    };
    StdandardResource.prototype.removeLock = function (uuid, owner, callback) {
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
    StdandardResource.prototype.canRemoveLock = function (uuid, owner, callback) {
        callback(null, this.lockBag.canRemoveLock(uuid, owner));
    };
    StdandardResource.prototype.canLock = function (lockKind, callback) {
        callback(null, this.lockBag.canLock(lockKind));
    };
    StdandardResource.prototype.setProperty = function (name, value, callback) {
        this.properties[name] = value;
        this.updateLastModified();
        callback(null);
    };
    StdandardResource.prototype.getProperty = function (name, callback) {
        var value = this.properties[name];
        if (value === undefined)
            callback(new Error('No property with such name.'), null);
        else
            callback(null, value);
    };
    StdandardResource.prototype.removeProperty = function (name, callback) {
        delete this.properties[name];
        this.updateLastModified();
        callback(null);
    };
    StdandardResource.prototype.creationDate = function (callback) {
        callback(null, this.dateCreation);
    };
    StdandardResource.prototype.lastModifiedDate = function (callback) {
        callback(null, this.dateLastModified);
    };
    return StdandardResource;
}());
exports.StdandardResource = StdandardResource;
var PhysicalResource = (function (_super) {
    __extends(PhysicalResource, _super);
    function PhysicalResource(realPath, parent, fsManager) {
        var _this = _super.call(this, parent, fsManager) || this;
        _this.realPath = path.resolve(realPath);
        return _this;
    }
    PhysicalResource.prototype.moveTo = function (to, callback) {
        callback(new Error('Not implemented yet.'), null, null);
    };
    PhysicalResource.prototype.rename = function (newName, callback) {
        var _this = this;
        var newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, function (e) {
            if (e) {
                callback(e, null, null);
                return;
            }
            var oldName = path.dirname(_this.realPath);
            _this.realPath = newPath;
            _this.updateLastModified();
            callback(e, oldName, newName);
        });
    };
    PhysicalResource.prototype.webName = function (callback) {
        callback(null, path.dirname(this.realPath));
    };
    return PhysicalResource;
}(StdandardResource));
exports.PhysicalResource = PhysicalResource;
var PhysicalFolder = (function (_super) {
    __extends(PhysicalFolder, _super);
    function PhysicalFolder(realPath, parent, fsManager) {
        var _this = _super.call(this, realPath, parent, fsManager) || this;
        _this.children = new ResourceChildren();
        return _this;
    }
    PhysicalFolder.prototype.create = function (callback) {
        fs.mkdir(this.realPath, callback);
    };
    PhysicalFolder.prototype.delete = function (callback) {
        var _this = this;
        this.getChildren(function (e, children) {
            if (e) {
                callback(e);
                return;
            }
            forAll(children, function (child, cb) {
                child.delete(cb);
            }, function () {
                fs.unlink(_this.realPath, function (e) {
                    if (e)
                        callback(e);
                    else
                        _this.removeFromParent(callback);
                });
            }, callback);
        });
    };
    PhysicalFolder.prototype.append = function (data, callback) {
        callback(new Error("Invalid operation"));
    };
    PhysicalFolder.prototype.write = function (data, callback) {
        callback(new Error("Invalid operation"));
    };
    PhysicalFolder.prototype.read = function (callback) {
        callback(new Error("Invalid operation"), null);
    };
    PhysicalFolder.prototype.mimeType = function (callback) {
        callback(null, 'directory');
    };
    PhysicalFolder.prototype.size = function (callback) {
        this.getChildren(function (e, children) {
            if (e) {
                callback(e, null);
                return;
            }
            var size = 0;
            forAll(children, function (child, cb) {
                child.size(function (e, s) {
                    if (e)
                        size += s;
                    cb(null);
                });
            }, function () { return callback(null, size); }, function (e) { return callback(e, null); });
        });
    };
    PhysicalFolder.prototype.addChild = function (resource, callback) {
        this.children.add(resource, callback);
    };
    PhysicalFolder.prototype.removeChild = function (resource, callback) {
        this.children.remove(resource, callback);
    };
    PhysicalFolder.prototype.getChildren = function (callback) {
        callback(null, this.children.children);
    };
    return PhysicalFolder;
}(PhysicalResource));
exports.PhysicalFolder = PhysicalFolder;
var ResourceChildren = (function () {
    function ResourceChildren() {
    }
    ResourceChildren.prototype.add = function (resource, callback) {
        if (this.children.some(function (c) { return c === resource; })) {
            callback(new Error("The resource already exists."));
            return;
        }
        this.children.push(resource);
        callback(null);
    };
    ResourceChildren.prototype.remove = function (resource, callback) {
        var index = this.children.indexOf(resource);
        if (index === -1) {
            callback(new Error("Can't find the resource."));
            return;
        }
        this.children = this.children.splice(index, 1);
        callback(null);
    };
    return ResourceChildren;
}());
exports.ResourceChildren = ResourceChildren;
var mimeTypes = require("mime-types");
var PhysicalFile = (function (_super) {
    __extends(PhysicalFile, _super);
    function PhysicalFile(realPath, parent, fsManager) {
        return _super.call(this, realPath, parent, fsManager) || this;
    }
    PhysicalFile.prototype.create = function (callback) {
        fs.open(this.realPath, fs.constants.O_CREAT, function (e, fd) {
            if (e)
                callback(e);
            else
                fs.close(fd, function (e) {
                    callback(e);
                });
        });
    };
    PhysicalFile.prototype.delete = function (callback) {
        var _this = this;
        fs.unlink(this.realPath, function (e) {
            if (e)
                callback(e);
            else
                _this.removeFromParent(callback);
        });
    };
    PhysicalFile.prototype.append = function (data, callback) {
        fs.appendFile(this.realPath, data, callback);
    };
    PhysicalFile.prototype.write = function (data, callback) {
        fs.writeFile(this.realPath, data, callback);
    };
    PhysicalFile.prototype.read = function (callback) {
        fs.readFile(this.realPath, callback);
    };
    PhysicalFile.prototype.mimeType = function (callback) {
        var mt = mimeTypes.lookup(this.realPath);
        callback(mt ? null : new Error("application/octet-stream"), mt);
    };
    PhysicalFile.prototype.size = function (callback) {
        fs.stat(this.realPath, function (e, s) { return callback(e, s ? s.size : null); });
    };
    PhysicalFile.prototype.addChild = function (resource, callback) {
        callback(new Error("Invalid operation"));
    };
    PhysicalFile.prototype.removeChild = function (resource, callback) {
        callback(new Error("Invalid operation"));
    };
    PhysicalFile.prototype.getChildren = function (callback) {
        callback(new Error("Invalid operation"), null);
    };
    return PhysicalFile;
}(PhysicalResource));
exports.PhysicalFile = PhysicalFile;
var http = require("http");
var url = require("url");
var MethodCallArgs = (function () {
    function MethodCallArgs(uri, request, response, resource, callback) {
        this.uri = uri;
        this.request = request;
        this.response = response;
        this.resource = resource;
        this.callback = callback;
    }
    return MethodCallArgs;
}());
exports.MethodCallArgs = MethodCallArgs;
var WebDAVServer = (function () {
    function WebDAVServer() {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = new Object();
        this.method('GET', function (arg, callback) {
            arg.response.write('<html><body>ok</body></html>');
            callback();
        });
    }
    WebDAVServer.prototype.start = function (port) {
        var _this = this;
        if (port === void 0) { port = 1900; }
        http.createServer(function (req, res) {
            var method = _this.methods[_this.normalizeMethodName(req.method)];
            if (method) {
                var base = _this.createMethodCallArgs(req, res);
                _this.invokeBeforeRequest(base, function () {
                    method(base, function () {
                        res.end();
                        _this.invokeAfterRequest(base, null);
                    });
                });
            }
        }).listen(port);
    };
    WebDAVServer.prototype.createMethodCallArgs = function (req, res) {
        var uri = url.parse(req.url).pathname;
        return new MethodCallArgs(uri, req, res, null, null);
    };
    WebDAVServer.prototype.normalizeMethodName = function (method) {
        return method.toLowerCase();
    };
    WebDAVServer.prototype.method = function (name, manager) {
        this.methods[this.normalizeMethodName(name)] = manager;
    };
    WebDAVServer.prototype.beforeRequest = function (manager) {
        this.beforeManagers.push(manager);
    };
    WebDAVServer.prototype.afterRequest = function (manager) {
        this.afterManagers.push(manager);
    };
    WebDAVServer.prototype.invokeBARequest = function (collection, base, callback) {
        if (collection.length === 0) {
            if (callback)
                callback();
            return;
        }
        base.callback = next;
        var nb = collection.length + 1;
        function next() {
            --nb;
            if (nb === 0) {
                if (callback)
                    callback();
            }
            else
                collection[collection.length - nb](base, next);
        }
        next();
    };
    WebDAVServer.prototype.invokeBeforeRequest = function (base, callback) {
        this.invokeBARequest(this.beforeManagers, base, callback);
    };
    WebDAVServer.prototype.invokeAfterRequest = function (base, callback) {
        this.invokeBARequest(this.afterManagers, base, callback);
    };
    return WebDAVServer;
}());
exports.WebDAVServer = WebDAVServer;
var serv = new WebDAVServer();
serv.beforeRequest(function (arg, next) {
    console.log(arg.uri);
    next();
});
serv.afterRequest(function (arg, next) {
    console.log('after');
    next();
});
serv.start(1900);
