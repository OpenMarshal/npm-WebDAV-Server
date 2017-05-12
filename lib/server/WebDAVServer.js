"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("./WebDAVRequest");
var RootResource_1 = require("../resource/RootResource");
var FSManager_1 = require("../manager/FSManager");
var http = require("http");
var Commands_1 = require("./commands/Commands");
var WebDAVServerOptions = (function () {
    function WebDAVServerOptions() {
        this.port = 1900;
    }
    return WebDAVServerOptions;
}());
exports.WebDAVServerOptions = WebDAVServerOptions;
var WebDAVServer = (function () {
    function WebDAVServer(options) {
        this.beforeManagers = [];
        this.rootResource = new RootResource_1.RootResource();
        this.afterManagers = [];
        this.methods = {};
        this.options = options;
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
                callback(new Error('404 Not Found'), null);
                return;
            }
            var found = false;
            var nb = children.length;
            function done() {
                --nb;
                if (nb === 0 && !found)
                    callback(new Error('404 Not Found'), null);
            }
            for (var k in children) {
                if (found)
                    break;
                children[k].webName(function (e, name) {
                    if (name === paths.rootName()) {
                        found = true;
                        paths.removeRoot();
                        _this.getResourceFromPath(paths, children[k], callback);
                    }
                    done();
                });
            }
        });
    };
    WebDAVServer.prototype.onUnknownMethod = function (unknownMethod) {
        this.unknownMethod = unknownMethod;
    };
    WebDAVServer.prototype.start = function (port) {
        var _this = this;
        if (port === void 0) { port = this.options.port; }
        this.server = http.createServer(function (req, res) {
            var method = _this.methods[_this.normalizeMethodName(req.method)];
            if (!method)
                method = _this.unknownMethod;
            var base = _this.createMethodCallArgs(req, res);
            if (!method.chunked) {
                var data_1 = '';
                var go_1 = function () {
                    base.data = data_1;
                    _this.invokeBeforeRequest(base, function () {
                        method(base, function () {
                            res.end();
                            _this.invokeAfterRequest(base, null);
                        });
                    });
                };
                if (base.contentLength === 0) {
                    go_1();
                }
                else {
                    req.on('data', function (chunk) {
                        data_1 += chunk.toString();
                        if (data_1.length >= base.contentLength) {
                            if (data_1.length > base.contentLength)
                                data_1 = data_1.substring(0, base.contentLength);
                            go_1();
                        }
                    });
                }
            }
        });
        this.server.listen(port);
    };
    WebDAVServer.prototype.stop = function (callback) {
        if (this.server) {
            this.server.close(function () { return callback(); });
            this.server = null;
        }
        else
            process.nextTick(callback);
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
    WebDAVServer.prototype.createMethodCallArgs = function (req, res) {
        return new WebDAVRequest_1.MethodCallArgs(this, req, res, null);
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
