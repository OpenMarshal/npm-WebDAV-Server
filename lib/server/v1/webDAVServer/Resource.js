"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FSManager_1 = require("../../../manager/v1/FSManager");
var Errors_1 = require("../../../Errors");
function getResourceFromPath(arg, path, callbackOrRootResource, callback) {
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
    if (rootResource.gateway && rootResource.gateway.constructor === Function) {
        rootResource.gateway(arg, paths, function (e, r) { return callback(e ? Errors_1.Errors.ResourceNotFound : null, r); });
        return;
    }
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
        var _loop_1 = function (k) {
            if (found)
                return "break";
            children[k].webName(function (e, name) {
                if (name === paths.rootName()) {
                    found = true;
                    paths.removeRoot();
                    _this.getResourceFromPath(arg, paths, children[k], callback);
                    return;
                }
                process.nextTick(done);
            });
        };
        for (var k in children) {
            var state_1 = _loop_1(k);
            if (state_1 === "break")
                break;
        }
    });
}
exports.getResourceFromPath = getResourceFromPath;
function addResourceTree(_rootResource, _resoureceTree, _callback) {
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
    var cb = callback;
    callback = function (e) {
        if (cb)
            cb(e);
    };
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
    else if (resoureceTree.fsManager !== undefined) { // resoureceTree is IResource
        rootResource.addChild(resoureceTree, callback);
    }
    else { // resoureceTree is IResourceTreeNode
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
}
exports.addResourceTree = addResourceTree;
