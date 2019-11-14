"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestContext_1 = require("../RequestContext");
var WebDAVServerOptions_1 = require("../WebDAVServerOptions");
var JSCompatibility_1 = require("../../../helper/JSCompatibility");
var Path_1 = require("../../../manager/v2/Path");
var Commands_1 = require("../commands/Commands");
var persistence = require("./Persistence");
var beforeAfter = require("./BeforeAfter");
var startStop = require("./StartStop");
var promise_1 = require("../../../helper/v2/promise");
var WebDAVServer = /** @class */ (function () {
    function WebDAVServer(options) {
        /**
         * Stop the WebDAV server.
         */
        this.stop = startStop.stop;
        /**
         * Execute a request as if the HTTP server received it.
         */
        this.executeRequest = startStop.executeRequest.bind(this);
        /**
         * Load the previous save made by the 'autoSave' system.
         */
        this.autoLoad = persistence.autoLoad;
        /**
         * Load a state of the resource tree.
         */
        this.load = persistence.load;
        /**
         * Save the state of the resource tree.
         */
        this.save = persistence.save;
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = WebDAVServerOptions_1.setDefaultServerOptions(options);
        this.events = {};
        this.httpAuthentication = this.options.httpAuthentication;
        this.privilegeManager = this.options.privilegeManager;
        this.fileSystems = {
            '/': this.options.rootFileSystem
        };
        // Implement all methods in commands/Commands.ts
        var commands = Commands_1.default;
        for (var k in commands)
            if (k === 'NotImplemented')
                this.onUnknownMethod(new commands[k]());
            else
                this.method(k, new commands[k]());
    }
    WebDAVServer.prototype.isSameFileSystem = function (fs, path, checkByReference) {
        return checkByReference && this.fileSystems[path] === fs || !checkByReference && this.fileSystems[path].serializer().uid() === fs.serializer().uid();
    };
    WebDAVServer.prototype.createExternalContext = function (_options, _callback) {
        return RequestContext_1.ExternalRequestContext.create(this, _options, _callback);
    };
    /**
     * Get the root file system.
     *
     * @returns The root file system
     */
    WebDAVServer.prototype.rootFileSystem = function () {
        return this.fileSystems['/'];
    };
    /**
     * Get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     */
    WebDAVServer.prototype.getResourceAsync = function (ctx, path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.getResource(ctx, path, cb); });
    };
    /**
     * Get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     * @param callback Callback containing the requested resource
     */
    WebDAVServer.prototype.getResource = function (ctx, path, callback) {
        path = new Path_1.Path(path);
        this.getFileSystem(path, function (fs, _, subPath) {
            callback(null, fs.resource(ctx, subPath));
        });
    };
    /**
     * Synchronously get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     * @returns The requested resource
     */
    WebDAVServer.prototype.getResourceSync = function (ctx, path) {
        path = new Path_1.Path(path);
        var info = this.getFileSystemSync(path);
        return info.fs.resource(ctx, info.subPath);
    };
    WebDAVServer.prototype.setFileSystemAsync = function (path, fs, override) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.setFileSystem(path, fs, override, function (successed) { return cb(undefined, successed); }); });
    };
    WebDAVServer.prototype.setFileSystem = function (path, fs, _override, _callback) {
        var override = _callback ? _override : undefined;
        var callback = _callback ? _callback : _override;
        var result = this.setFileSystemSync(path, fs, override);
        if (callback)
            callback(result);
    };
    /**
     * Synchronously map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     * @returns The status of the mounting
     */
    WebDAVServer.prototype.setFileSystemSync = function (path, fs, override) {
        if (override === void 0) { override = true; }
        var sPath = new Path_1.Path(path).toString();
        if (!override && this.fileSystems[sPath])
            return false;
        this.fileSystems[sPath] = fs;
        return true;
    };
    WebDAVServer.prototype.removeFileSystem = function (fs_path, _checkByReference, _callback) {
        var checkByReference = _callback ? _checkByReference : true;
        var callback = _callback ? _callback : _checkByReference;
        var result = this.removeFileSystemSync(fs_path, checkByReference);
        if (callback)
            callback(result);
    };
    WebDAVServer.prototype.removeFileSystemSync = function (fs_path, checkByReference) {
        if (checkByReference === void 0) { checkByReference = true; }
        var nb = 0;
        if (fs_path.constructor === Path_1.Path || fs_path.constructor === String) {
            var path = new Path_1.Path(fs_path).toString();
            if (this.fileSystems[path] !== undefined) {
                delete this.fileSystems[path];
                nb = 1;
            }
        }
        else {
            var fs = fs_path;
            for (var name_1 in this.fileSystems) {
                if (this.isSameFileSystem(fs, name_1, checkByReference)) {
                    delete this.fileSystems[name_1];
                    ++nb;
                }
            }
        }
        return nb;
    };
    WebDAVServer.prototype.getFileSystemPath = function (fs, _checkByReference, _callback) {
        var checkByReference = _callback ? _checkByReference : undefined;
        var callback = _callback ? _callback : _checkByReference;
        callback(this.getFileSystemPathSync(fs, checkByReference));
    };
    /**
     * Synchronously get the mount path of a file system.
     *
     * @param fs File system
     * @param checkByReference Define if the file system must be matched by reference or by its serializer's UID
     * @returns The mount path of the file system
     */
    WebDAVServer.prototype.getFileSystemPathSync = function (fs, checkByReference) {
        checkByReference = checkByReference === null || checkByReference === undefined ? true : checkByReference;
        for (var path in this.fileSystems)
            if (this.isSameFileSystem(fs, path, checkByReference))
                return new Path_1.Path(path);
        return null;
    };
    /**
     * Get the list of file systems mounted on or under the parentPath.
     *
     * @param parentPath Path from which list sub file systems
     * @param callback Callback containing the list of file systems found and their mount path
     */
    WebDAVServer.prototype.getChildFileSystems = function (parentPath, callback) {
        var result = this.getChildFileSystemsSync(parentPath);
        callback(result);
    };
    /**
     * Synchronously get the list of file systems mounted on or under the parentPath.
     *
     * @param parentPath Path from which list sub file systems
     * @returns Object containing the list of file systems found and their mount path
     */
    WebDAVServer.prototype.getChildFileSystemsSync = function (parentPath) {
        var results = [];
        var seekPath = parentPath.toString(true);
        for (var fsPath in this.fileSystems) {
            var pfsPath = new Path_1.Path(fsPath);
            if (pfsPath.paths.length === parentPath.paths.length + 1 && JSCompatibility_1.startsWith(fsPath, seekPath)) {
                results.push({
                    fs: this.fileSystems[fsPath],
                    path: pfsPath
                });
            }
        }
        return results;
    };
    /**
     * Get the file system managing the provided path.
     *
     * @param path Requested path
     */
    WebDAVServer.prototype.getFileSystemAsync = function (path) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.getFileSystem(path, function (fs, rootPath, subPath) { return cb(undefined, { fs: fs, rootPath: rootPath, subPath: subPath }); }); });
    };
    /**
     * Get the file system managing the provided path.
     *
     * @param path Requested path
     * @param callback Callback containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
    WebDAVServer.prototype.getFileSystem = function (path, callback) {
        var result = this.getFileSystemSync(path);
        callback(result.fs, result.rootPath, result.subPath);
    };
    /**
     * Get synchronously the file system managing the provided path.
     *
     * @param path Requested path
     * @returns Object containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
    WebDAVServer.prototype.getFileSystemSync = function (path) {
        var best = {
            index: 0,
            rootPath: new Path_1.Path('/')
        };
        for (var fsPath in this.fileSystems) {
            var pfsPath = new Path_1.Path(fsPath);
            if (path.paths.length < pfsPath.paths.length)
                continue;
            var value = 0;
            for (; value < pfsPath.paths.length; ++value)
                if (pfsPath.paths[value] !== path.paths[value]) {
                    value = -1;
                    break;
                }
            if (best.index < value)
                best = {
                    index: value,
                    rootPath: pfsPath
                };
            if (value === path.paths.length)
                break; // Found the best value possible.
        }
        var subPath = path.clone();
        for (var _i = 0, _a = best.rootPath.paths; _i < _a.length; _i++) {
            var _ = _a[_i];
            subPath.removeRoot();
        }
        return {
            fs: this.fileSystems[best.rootPath.toString()],
            rootPath: best.rootPath,
            subPath: subPath
        };
    };
    /**
     * Action to execute when the requested method is unknown.
     *
     * @param unknownMethod Action to execute
     */
    WebDAVServer.prototype.onUnknownMethod = function (unknownMethod) {
        this.unknownMethod = unknownMethod;
    };
    WebDAVServer.prototype.listResourcesAsync = function (root) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.listResources(root, function (paths) { return cb(undefined, paths); }); });
    };
    WebDAVServer.prototype.listResources = function (_root, _callback) {
        var _this = this;
        var root = new Path_1.Path(Path_1.Path.isPath(_root) ? _root : '/');
        var callback = _callback ? _callback : _root;
        var output = [];
        output.push(root.toString());
        this.getResource(this.createExternalContext(), root, function (e, resource) {
            resource.readDir(true, function (e, files) {
                if (e || files.length === 0)
                    return callback(output);
                var nb = files.length;
                files.forEach(function (fileName) {
                    var childPath = root.getChildPath(fileName);
                    _this.listResources(childPath, function (outputs) {
                        outputs.forEach(function (o) { return output.push(o); });
                        if (--nb === 0)
                            callback(output);
                    });
                });
            });
        });
    };
    WebDAVServer.prototype.startAsync = function (port) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.start(port, function (server) { return cb(undefined, server); }); });
    };
    WebDAVServer.prototype.start = function (port, callback) {
        startStop.start.bind(this)(port, callback);
    };
    /**
     * Stop the WebDAV server.
     */
    WebDAVServer.prototype.stopAsync = function () {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.stop(cb); });
    };
    WebDAVServer.prototype.autoSave = function (options) {
        var fn = persistence.autoSave.bind(this);
        if (options)
            fn(options);
        else if (this.options.autoSave)
            fn(this.options.autoSave);
    };
    /**
     * Force the autoSave system to save when available.
     */
    WebDAVServer.prototype.forceAutoSave = function () {
        this.autoSavePool.save();
    };
    /**
     * Load the previous save made by the 'autoSave' system.
     */
    WebDAVServer.prototype.autoLoadAsync = function () {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.autoLoad(cb); });
    };
    /**
     * Load a state of the resource tree.
     */
    WebDAVServer.prototype.loadAsync = function (data, serializers) {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.load(data, serializers, cb); });
    };
    /**
     * Save the state of the resource tree.
     */
    WebDAVServer.prototype.saveAsync = function () {
        var _this = this;
        return promise_1.promisifyCall(function (cb) { return _this.save(cb); });
    };
    /**
     * Define an action to execute when a HTTP method is requested.
     *
     * @param name Name of the method to bind to
     * @param manager Action to execute when the method is requested
     */
    WebDAVServer.prototype.method = function (name, manager) {
        this.methods[this.normalizeMethodName(name)] = manager;
    };
    WebDAVServer.prototype.on = function (event, listener) {
        if (!this.events[event])
            this.events[event] = [];
        this.events[event].push(listener);
        return this;
    };
    WebDAVServer.prototype.removeEvent = function (event, listener) {
        if (listener) {
            if (this.events[event]) {
                var eventList = this.events[event];
                for (var index = 0; index < eventList.length; ++index) {
                    if (eventList[index] === listener) {
                        eventList.splice(index, 1);
                        --index;
                    }
                }
            }
        }
        else {
            delete this.events[event];
        }
        return this;
    };
    /**
     * Trigger an event.
     *
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param fs File system on which the event happened.
     * @param path Path of the resource on which the event happened.
     */
    WebDAVServer.prototype.emit = function (event, ctx, fs, path, data) {
        if (!this.events[event])
            return;
        this.events[event].forEach(function (l) { return process.nextTick(function () { return l(ctx, fs, path.constructor === String ? new Path_1.Path(path) : path, data); }); });
    };
    /**
     * Normalize the name of the method.
     */
    WebDAVServer.prototype.normalizeMethodName = function (method) {
        return method.toLowerCase();
    };
    // Before / After execution
    /**
     * Invoke the BeforeRequest events.
     *
     * @param base Context of the request
     * @param callback Callback to execute when all BeforeRequest events have been executed
     */
    WebDAVServer.prototype.invokeBeforeRequest = function (base, callback) {
        beforeAfter.invokeBeforeRequest.bind(this)(base, callback);
    };
    /**
     * Invoke the AfterRequest events.
     *
     * @param base Context of the request
     * @param callback Callback to execute when all AfterRequest events have been executed
     */
    WebDAVServer.prototype.invokeAfterRequest = function (base, callback) {
        beforeAfter.invokeAfterRequest.bind(this)(base, callback);
    };
    /**
     * Action to execute before an operation is executed when a HTTP request is received.
     *
     * @param manager Action to execute
     */
    WebDAVServer.prototype.beforeRequest = function (manager) {
        this.beforeManagers.push(manager);
    };
    /**
     * Action to execute after an operation is executed when a HTTP request is received.
     *
     * @param manager Action to execute
     */
    WebDAVServer.prototype.afterRequest = function (manager) {
        this.afterManagers.push(manager);
    };
    return WebDAVServer;
}());
exports.WebDAVServer = WebDAVServer;
