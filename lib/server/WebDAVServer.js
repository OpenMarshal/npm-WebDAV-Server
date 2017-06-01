"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("./WebDAVRequest");
var WebDAVServerOptions_1 = require("./WebDAVServerOptions");
var ISerializer_1 = require("../manager/ISerializer");
var FSManager_1 = require("../manager/FSManager");
var Errors_1 = require("../Errors");
var Commands_1 = require("./commands/Commands");
var http = require("http");
var WebDAVServerOptions_2 = require("./WebDAVServerOptions");
exports.WebDAVServerOptions = WebDAVServerOptions_2.WebDAVServerOptions;
var WebDAVServer = (function () {
    function WebDAVServer(options) {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = WebDAVServerOptions_1.setDefaultServerOptions(options);
        this.httpAuthentication = this.options.httpAuthentication;
        this.privilegeManager = this.options.privilegeManager;
        this.rootResource = this.options.rootResource;
        this.userManager = this.options.userManager;
        for (var k in Commands_1.default)
            if (k === 'NotImplemented')
                this.onUnknownMethod(Commands_1.default[k]);
            else
                this.method(k, Commands_1.default[k]);
    }
    WebDAVServer.prototype.getResourceFromPath = function (path, callbackOrRootResource, callback) {
        var _this = this;
        var rootResource;
        if (callbackOrRootResource instanceof Function) {
            callback = callbackOrRootResource;
            rootResource = this.rootResource;
        }
        else
            rootResource = callbackOrRootResource;
        var paths;
        if (path.constructor === FSManager_1.FSPath)
            paths = path;
        else
            paths = new FSManager_1.FSPath(path);
        if (paths.isRoot()) {
            callback(null, rootResource);
            return;
        }
        rootResource.getChildren(function (e, children) {
            if (e) {
                callback(e, null);
                return;
            }
            if (children.length === 0) {
                callback(Errors_1.Errors.ResourceNotFound, null);
                return;
            }
            var found = false;
            var nb = children.length;
            function done() {
                --nb;
                if (nb === 0 && !found)
                    process.nextTick(function () { return callback(Errors_1.Errors.ResourceNotFound, null); });
            }
            for (var k in children) {
                if (found)
                    break;
                children[k].webName(function (e, name) {
                    if (name === paths.rootName()) {
                        found = true;
                        paths.removeRoot();
                        _this.getResourceFromPath(paths, children[k], callback);
                        return;
                    }
                    process.nextTick(done);
                });
            }
        });
    };
    WebDAVServer.prototype.addResourceTree = function (_rootResource, _resoureceTree, _callback) {
        var _this = this;
        var rootResource;
        var resoureceTree;
        var callback = _callback;
        if (!callback) {
            resoureceTree = _rootResource;
            rootResource = this.rootResource;
            callback = _resoureceTree;
        }
        else {
            resoureceTree = _resoureceTree;
            rootResource = _rootResource;
        }
        if (resoureceTree.constructor === Array) {
            var array = resoureceTree;
            if (array.length === 0) {
                callback(null);
                return;
            }
            var nb_1 = array.length;
            var doneArray_1 = function (e) {
                if (nb_1 <= 0)
                    return;
                if (e) {
                    nb_1 = -1;
                    callback(e);
                    return;
                }
                --nb_1;
                if (nb_1 === 0)
                    callback(null);
            };
            array.forEach(function (r) { return _this.addResourceTree(rootResource, r, doneArray_1); });
        }
        else if (resoureceTree.fsManager) {
            rootResource.addChild(resoureceTree, callback);
        }
        else {
            var irtn = resoureceTree;
            var resource_1 = irtn.r ? irtn.r : irtn.resource;
            var children_1 = irtn.c ? irtn.c : irtn.children;
            rootResource.addChild(resource_1, function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                if (children_1 && children_1.constructor !== Array) {
                    _this.addResourceTree(resource_1, children_1, callback);
                    return;
                }
                if (!children_1 || children_1.length === 0) {
                    callback(null);
                    return;
                }
                var nb = children_1.length;
                function done(e) {
                    if (nb <= 0)
                        return;
                    if (e) {
                        nb = -1;
                        callback(e);
                        return;
                    }
                    --nb;
                    if (nb === 0)
                        callback(null);
                }
                children_1.forEach(function (c) { return _this.addResourceTree(resource_1, c, done); });
            });
        }
    };
    WebDAVServer.prototype.onUnknownMethod = function (unknownMethod) {
        this.unknownMethod = unknownMethod;
    };
    WebDAVServer.prototype.start = function (port, callback) {
        var _this = this;
        var _port = this.options.port;
        var _callback;
        if (port && port.constructor === Number) {
            _port = port;
            if (callback) {
                if (callback instanceof Function)
                    _callback = callback;
                else
                    throw Errors_1.Errors.IllegalArguments;
            }
        }
        else if (port && port.constructor === Function) {
            _port = this.options.port;
            _callback = port;
            if (callback)
                throw Errors_1.Errors.IllegalArguments;
        }
        if (!this.server) {
            this.server = http.createServer(function (req, res) {
                var method = _this.methods[_this.normalizeMethodName(req.method)];
                if (!method)
                    method = _this.unknownMethod;
                WebDAVRequest_1.MethodCallArgs.create(_this, req, res, function (e, base) {
                    if (e) {
                        if (e === Errors_1.Errors.AuenticationPropertyMissing)
                            base.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                        else
                            base.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        res.end();
                        return;
                    }
                    base.exit = function () {
                        base.response.end();
                        _this.invokeAfterRequest(base, null);
                    };
                    if (!_this.options.canChunk || !method.startChunked || base.contentLength <= 0) {
                        var go_1 = function () {
                            _this.invokeBeforeRequest(base, function () {
                                method(base, base.exit);
                            });
                        };
                        if (base.contentLength <= 0) {
                            base.data = new Buffer(0);
                            go_1();
                        }
                        else {
                            var data_1 = new Buffer(base.contentLength);
                            var index_1 = 0;
                            req.on('data', function (chunk) {
                                if (chunk.constructor === String)
                                    chunk = new Buffer(chunk);
                                for (var i = 0; i < chunk.length && index_1 < data_1.length; ++i, ++index_1)
                                    data_1[index_1] = chunk[i];
                                if (index_1 >= base.contentLength) {
                                    base.data = data_1;
                                    go_1();
                                }
                            });
                        }
                    }
                    else {
                        _this.invokeBeforeRequest(base, function () {
                            _this.invokeBeforeRequest(base, function () {
                                method.startChunked(base, function (error, onData) {
                                    if (error) {
                                        base.setCode(error.HTTPCode);
                                        base.exit();
                                        return;
                                    }
                                    if (!onData) {
                                        base.exit();
                                        return;
                                    }
                                    var size = 0;
                                    req.on('data', function (chunk) {
                                        if (chunk.constructor === String)
                                            chunk = new Buffer(chunk);
                                        size += chunk.length;
                                        onData(chunk, size === chunk.length, size >= base.contentLength);
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }
        this.server.listen(_port, this.options.hostname, function () {
            if (_callback)
                _callback(_this.server);
        });
    };
    WebDAVServer.prototype.stop = function (callback) {
        if (this.server) {
            this.server.close(callback);
            this.server = null;
        }
        else
            process.nextTick(callback);
    };
    WebDAVServer.prototype.load = function (obj, managers, callback) {
        var _this = this;
        ISerializer_1.unserialize(obj, managers, function (e, r) {
            if (!e) {
                _this.rootResource = r;
                callback(null);
            }
            else
                callback(e);
        });
    };
    WebDAVServer.prototype.save = function (callback) {
        ISerializer_1.serialize(this.rootResource, callback);
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
    WebDAVServer.prototype.normalizeMethodName = function (method) {
        return method.toLowerCase();
    };
    WebDAVServer.prototype.invokeBARequest = function (collection, base, callback) {
        function callCallback() {
            if (callback)
                process.nextTick(callback);
        }
        if (collection.length === 0) {
            callCallback();
            return;
        }
        base.callback = next;
        var nb = collection.length + 1;
        function next() {
            --nb;
            if (nb === 0) {
                callCallback();
            }
            else
                process.nextTick(function () { return collection[collection.length - nb](base, next); });
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
