"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("./WebDAVRequest");
var http = require("http");
var url = require("url");
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
        this.afterManagers = [];
        this.methods = new Object();
        this.options = options;
        this.method('GET', function (arg, callback) {
            arg.response.write('<html><body>ok</body></html>');
            callback();
        });
        this.onUnknownMethod(function (arg, callback) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotImplemented);
            callback();
        });
    }
    WebDAVServer.prototype.onUnknownMethod = function (unknownMethod) {
        this.unknownMethod = unknownMethod;
    };
    WebDAVServer.prototype.start = function (port) {
        var _this = this;
        if (port === void 0) { port = this.options.port; }
        http.createServer(function (req, res) {
            var method = _this.methods[_this.normalizeMethodName(req.method)];
            if (!method)
                method = _this.unknownMethod;
            var base = _this.createMethodCallArgs(req, res);
            _this.invokeBeforeRequest(base, function () {
                method(base, function () {
                    res.end();
                    _this.invokeAfterRequest(base, null);
                });
            });
        }).listen(port);
    };
    WebDAVServer.prototype.createMethodCallArgs = function (req, res) {
        var uri = url.parse(req.url).pathname;
        return new WebDAVRequest_1.MethodCallArgs(uri, req, res, null, null);
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
