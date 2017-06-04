"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVServerOptions_1 = require("../WebDAVServerOptions");
var Commands_1 = require("../commands/Commands");
var persistence = require("./Persistence");
var beforeAfter = require("./BeforeAfter");
var startStop = require("./StartStop");
var resource = require("./Resource");
var WebDAVServerOptions_2 = require("../WebDAVServerOptions");
exports.WebDAVServerOptions = WebDAVServerOptions_2.WebDAVServerOptions;
var WebDAVServer = (function () {
    function WebDAVServer(options) {
        this.stop = startStop.stop;
        this.load = persistence.load;
        this.save = persistence.save;
        this.beforeRequest = beforeAfter.beforeRequest;
        this.afterRequest = beforeAfter.afterRequest;
        this.invokeBARequest = beforeAfter.invokeBARequest;
        this.invokeBeforeRequest = beforeAfter.invokeBeforeRequest;
        this.invokeAfterRequest = beforeAfter.invokeAfterRequest;
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
        resource.getResourceFromPath.bind(this)(path, callbackOrRootResource, callback);
    };
    WebDAVServer.prototype.addResourceTree = function (_rootResource, _resoureceTree, _callback) {
        resource.addResourceTree.bind(this)(_rootResource, _resoureceTree, _callback);
    };
    WebDAVServer.prototype.onUnknownMethod = function (unknownMethod) {
        this.unknownMethod = unknownMethod;
    };
    WebDAVServer.prototype.start = function (port, callback) {
        startStop.start.bind(this)(port, callback);
    };
    WebDAVServer.prototype.method = function (name, manager) {
        this.methods[this.normalizeMethodName(name)] = manager;
    };
    WebDAVServer.prototype.normalizeMethodName = function (method) {
        return method.toLowerCase();
    };
    return WebDAVServer;
}());
exports.WebDAVServer = WebDAVServer;
