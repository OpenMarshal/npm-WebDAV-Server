"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVServerOptions_1 = require("../WebDAVServerOptions");
var Commands_1 = require("../commands/Commands");
var persistence = require("./Persistence");
var beforeAfter = require("./BeforeAfter");
var startStop = require("./StartStop");
var resource = require("./Resource");
var events = require("./Events");
var WebDAVServerOptions_2 = require("../WebDAVServerOptions");
exports.WebDAVServerOptions = WebDAVServerOptions_2.WebDAVServerOptions;
/**
 * @deprecated This is a class of the versoin 1 of webdav-server, prefer using the version 2. This class and all v1 classes will be removed in a future release.
 */
var WebDAVServer = /** @class */ (function () {
    function WebDAVServer(options) {
        this.stop = startStop.stop;
        // Persistence
        this.autoLoad = persistence.autoLoad;
        this.load = persistence.load;
        this.save = persistence.save;
        // Before / After execution
        this.beforeRequest = beforeAfter.beforeRequest;
        this.afterRequest = beforeAfter.afterRequest;
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
        // Implement all methods in commands/Commands.ts
        for (var k in Commands_1.default)
            if (k === 'NotImplemented')
                this.onUnknownMethod(Commands_1.default[k]);
            else
                this.method(k, Commands_1.default[k]);
    }
    WebDAVServer.prototype.getResourceFromPath = function (arg, path, callbackOrRootResource, callback) {
        resource.getResourceFromPath.bind(this)(arg, path, callbackOrRootResource, callback);
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
    // Events
    WebDAVServer.prototype.invoke = function (event, arg, subjectResource, details) {
        events.invoke.bind(this)(event, subjectResource, details);
    };
    WebDAVServer.prototype.on = function (event, eName_listener, listener) {
        if (eName_listener.constructor === Function)
            events.register.bind(this)(event, eName_listener);
        else
            events.registerWithName.bind(this)(event, eName_listener, listener);
    };
    WebDAVServer.prototype.clearEvent = function (event) {
        events.clear.bind(this)(event);
    };
    WebDAVServer.prototype.clearEvents = function (event) {
        events.clearAll.bind(this)();
    };
    WebDAVServer.prototype.removeEvent = function (event, eName_listener) {
        if (eName_listener.constructor === Function)
            events.remove.bind(this)(event, eName_listener);
        else
            events.removeByName.bind(this)(event, eName_listener);
    };
    return WebDAVServer;
}());
exports.WebDAVServer = WebDAVServer;
