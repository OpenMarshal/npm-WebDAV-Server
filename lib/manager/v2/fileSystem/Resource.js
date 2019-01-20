"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = require("../Path");
var Resource = /** @class */ (function () {
    function Resource(path, fs, context) {
        this.fs = fs;
        this.context = context;
        this.path = new Path_1.Path(path);
    }
    Resource.prototype.delete = function (_depth, _callback) {
        this.fs.delete(this.context, this.path, _depth, _callback);
    };
    Resource.prototype.openWriteStream = function (_mode, _targetSource, _estimatedSize, _callback) {
        this.fs.openWriteStream(this.context, this.path, _mode, _targetSource, _estimatedSize, _callback);
    };
    Resource.prototype.openReadStream = function (_targetSource, _estimatedSize, _callback) {
        this.fs.openReadStream(this.context, this.path, _targetSource, _estimatedSize, _callback);
    };
    Resource.prototype.copy = function (pathTo, _overwrite, _depth, _callback) {
        this.fs.copy(this.context, this.path, pathTo, _overwrite, _depth, _callback);
    };
    Resource.prototype.mimeType = function (_targetSource, _callback) {
        this.fs.mimeType(this.context, this.path, _targetSource, _callback);
    };
    Resource.prototype.size = function (_targetSource, _callback) {
        this.fs.size(this.context, this.path, _targetSource, _callback);
    };
    Resource.prototype.addSubTree = function (tree, callback) {
        this.fs.addSubTree(this.context, this.path, tree, callback);
    };
    Resource.prototype.create = function (type, _createIntermediates, _callback) {
        this.fs.create(this.context, this.path, type, _createIntermediates, _callback);
    };
    Resource.prototype.etag = function (callback) {
        this.fs.etag(this.context, this.path, callback);
    };
    Resource.prototype.move = function (pathTo, _overwrite, _callback) {
        this.fs.move(this.context, this.path, pathTo, _overwrite, _callback);
    };
    Resource.prototype.rename = function (newName, _overwrite, _callback) {
        this.fs.rename(this.context, this.path, newName, _overwrite, _callback);
    };
    Resource.prototype.availableLocks = function (callback) {
        this.fs.availableLocks(this.context, this.path, callback);
    };
    Resource.prototype.lockManager = function (callback) {
        this.fs.lockManager(this.context, this.path, callback);
    };
    Resource.prototype.propertyManager = function (callback) {
        this.fs.propertyManager(this.context, this.path, callback);
    };
    Resource.prototype.readDir = function (_retrieveExternalFiles, _callback) {
        this.fs.readDir(this.context, this.path, _retrieveExternalFiles, _callback);
    };
    Resource.prototype.creationDate = function (callback) {
        this.fs.creationDate(this.context, this.path, callback);
    };
    Resource.prototype.lastModifiedDate = function (callback) {
        this.fs.lastModifiedDate(this.context, this.path, callback);
    };
    Resource.prototype.webName = function (callback) {
        this.fs.webName(this.context, this.path, callback);
    };
    Resource.prototype.displayName = function (callback) {
        this.fs.displayName(this.context, this.path, callback);
    };
    Resource.prototype.type = function (callback) {
        this.fs.type(this.context, this.path, callback);
    };
    Resource.prototype.listDeepLocks = function (_depth, _callback) {
        this.fs.listDeepLocks(this.context, this.path, _depth, _callback);
    };
    Resource.prototype.isLocked = function (_depth, _callback) {
        this.fs.isLocked(this.context, this.path, _depth, _callback);
    };
    return Resource;
}());
exports.Resource = Resource;
