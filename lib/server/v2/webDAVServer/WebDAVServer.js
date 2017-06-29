"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVServerOptions_1 = require("../WebDAVServerOptions");
var RequestContext_1 = require("../RequestContext");
var Commands_1 = require("../commands/Commands");
var Path_1 = require("../../../manager/v2/Path");
var persistence = require("./Persistence");
var beforeAfter = require("./BeforeAfter");
var startStop = require("./StartStop");
var WebDAVServer = (function () {
    function WebDAVServer(options) {
        this.stop = startStop.stop;
        // Persistence
        this.autoLoad = persistence.autoLoad;
        this.load = persistence.load;
        this.save = persistence.save;
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = WebDAVServerOptions_1.setDefaultServerOptions(options);
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
    WebDAVServer.prototype.createExternalContext = function (_options, _callback) {
        return RequestContext_1.RequestContext.createExternal(this, _options, _callback);
    };
    WebDAVServer.prototype.rootFileSystem = function () {
        return this.fileSystems['/'];
    };
    WebDAVServer.prototype.getResource = function (ctx, path, callback) {
        path = new Path_1.Path(path);
        this.getFileSystem(path, function (fs, _, subPath) {
            callback(null, fs.resource(ctx, subPath));
        });
    };
    WebDAVServer.prototype.setFileSystem = function (path, fs, _override, _callback) {
        var override = _callback ? _override : undefined;
        var callback = _callback ? _callback : _override;
        var result = this.setFileSystemSync(path, fs, override);
        if (callback)
            callback(result);
    };
    WebDAVServer.prototype.setFileSystemSync = function (path, fs, override) {
        if (override === void 0) { override = true; }
        var sPath = new Path_1.Path(path).toString();
        if (!override && this.fileSystems[sPath])
            return false;
        this.fileSystems[sPath] = fs;
        return true;
    };
    WebDAVServer.prototype.removeFileSystem = function (fs_path, _checkByReference, _callback) {
        var checkByReference = _callback ? _checkByReference : false;
        var callback = _callback ? _callback : _checkByReference;
        var result = this.removeFileSystemSync(fs_path, checkByReference);
        if (callback)
            callback(result);
    };
    WebDAVServer.prototype.removeFileSystemSync = function (fs_path, checkByReference) {
        if (checkByReference === void 0) { checkByReference = false; }
        if (fs_path.constructor === Path_1.Path || fs_path.constructor === String) {
            var path = new Path_1.Path(fs_path).toString();
            if (this.fileSystems[path] === undefined)
                return 0;
            else {
                delete this.fileSystems[path];
                return 1;
            }
        }
        else {
            var fs = fs_path;
            var nb = 0;
            for (var name_1 in this.fileSystems)
                if (checkByReference && this.fileSystems[name_1] === fs || !checkByReference && this.fileSystems[name_1].serializer().uid() === fs.serializer().uid()) {
                    ++nb;
                    delete this.fileSystems[name_1];
                }
            return nb;
        }
    };
    WebDAVServer.prototype.getFileSystemPath = function (fs, _checkByReference, _callback) {
        var checkByReference = _callback ? _checkByReference : undefined;
        var callback = _callback ? _callback : _checkByReference;
        callback(this.getFileSystemPathSync(fs, checkByReference));
    };
    WebDAVServer.prototype.getFileSystemPathSync = function (fs, checkByReference) {
        checkByReference = checkByReference === null || checkByReference === undefined ? true : checkByReference;
        for (var path in this.fileSystems)
            if (checkByReference && this.fileSystems[path] === fs || !checkByReference && this.fileSystems[path].serializer().uid() === fs.serializer().uid())
                return new Path_1.Path(path);
        return null;
    };
    WebDAVServer.prototype.getChildFileSystems = function (parentPath, callback) {
        var result = this.getChildFileSystemsSync(parentPath);
        callback(result);
    };
    WebDAVServer.prototype.getChildFileSystemsSync = function (parentPath) {
        var results = [];
        var seekPath = parentPath.toString(true);
        for (var fsPath in this.fileSystems) {
            var pfsPath = new Path_1.Path(fsPath);
            if (pfsPath.paths.length === parentPath.paths.length + 1 && fsPath.indexOf(seekPath) === 0)
                results.push({
                    fs: this.fileSystems[fsPath],
                    path: pfsPath
                });
        }
        return results;
    };
    WebDAVServer.prototype.getFileSystem = function (path, callback) {
        var result = this.getFileSystemSync(path);
        callback(result.fs, result.rootPath, result.subPath);
    };
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
    // Before / After execution
    WebDAVServer.prototype.invokeBeforeRequest = function (base, callback) {
        beforeAfter.invokeBeforeRequest.bind(this)(base, callback);
    };
    WebDAVServer.prototype.invokeAfterRequest = function (base, callback) {
        beforeAfter.invokeAfterRequest.bind(this)(base, callback);
    };
    WebDAVServer.prototype.beforeRequest = function (manager) {
        this.beforeManagers.push(manager);
    };
    WebDAVServer.prototype.afterRequest = function (manager) {
        this.afterManagers.push(manager);
    };
    return WebDAVServer;
}());
exports.WebDAVServer = WebDAVServer;
