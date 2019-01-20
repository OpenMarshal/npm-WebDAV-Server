"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = require("./Resource");
var ContextualFileSystem = /** @class */ (function () {
    function ContextualFileSystem(fs, context) {
        this.fs = fs;
        this.context = context;
    }
    ContextualFileSystem.prototype.resource = function (path) {
        return new Resource_1.Resource(path, this.fs, this.context);
    };
    ContextualFileSystem.prototype.delete = function (path, _depth, _callback) {
        this.fs.delete(this.context, path, _depth, _callback);
    };
    ContextualFileSystem.prototype.openWriteStream = function (path, _mode, _targetSource, _estimatedSize, _callback) {
        this.fs.openWriteStream(this.context, path, _mode, _targetSource, _estimatedSize, _callback);
    };
    ContextualFileSystem.prototype.openReadStream = function (path, _targetSource, _estimatedSize, _callback) {
        this.fs.openReadStream(this.context, path, _targetSource, _estimatedSize, _callback);
    };
    ContextualFileSystem.prototype.copy = function (pathFrom, pathTo, _overwrite, _depth, _callback) {
        this.fs.copy(this.context, pathFrom, pathTo, _overwrite, _depth, _callback);
    };
    ContextualFileSystem.prototype.mimeType = function (path, _targetSource, _callback) {
        this.fs.mimeType(this.context, path, _targetSource, _callback);
    };
    ContextualFileSystem.prototype.size = function (path, _targetSource, _callback) {
        this.fs.size(this.context, path, _targetSource, _callback);
    };
    ContextualFileSystem.prototype.addSubTree = function (rootPath, tree, callback) {
        this.fs.size(this.context, rootPath, tree, callback);
    };
    ContextualFileSystem.prototype.create = function (path, type, _createIntermediates, _callback) {
        this.fs.create(this.context, path, type, _createIntermediates, _callback);
    };
    ContextualFileSystem.prototype.etag = function (path, callback) {
        this.fs.etag(this.context, path, callback);
    };
    ContextualFileSystem.prototype.move = function (pathFrom, pathTo, _overwrite, _callback) {
        this.fs.move(this.context, pathFrom, pathTo, _overwrite, _callback);
    };
    ContextualFileSystem.prototype.rename = function (pathFrom, newName, _overwrite, _callback) {
        this.fs.rename(this.context, pathFrom, newName, _overwrite, _callback);
    };
    ContextualFileSystem.prototype.availableLocks = function (path, callback) {
        this.fs.availableLocks(this.context, path, callback);
    };
    ContextualFileSystem.prototype.lockManager = function (path, callback) {
        this.fs.lockManager(this.context, path, callback);
    };
    ContextualFileSystem.prototype.propertyManager = function (path, callback) {
        this.fs.propertyManager(this.context, path, callback);
    };
    ContextualFileSystem.prototype.readDir = function (path, _retrieveExternalFiles, _callback) {
        this.fs.readDir(this.context, path, _retrieveExternalFiles, _callback);
    };
    ContextualFileSystem.prototype.creationDate = function (path, callback) {
        this.fs.creationDate(this.context, path, callback);
    };
    ContextualFileSystem.prototype.lastModifiedDate = function (path, callback) {
        this.fs.lastModifiedDate(this.context, path, callback);
    };
    ContextualFileSystem.prototype.webName = function (path, callback) {
        this.fs.webName(this.context, path, callback);
    };
    ContextualFileSystem.prototype.displayName = function (path, callback) {
        this.fs.displayName(this.context, path, callback);
    };
    ContextualFileSystem.prototype.type = function (path, callback) {
        this.fs.type(this.context, path, callback);
    };
    ContextualFileSystem.prototype.listDeepLocks = function (startPath, _depth, _callback) {
        this.fs.listDeepLocks(this.context, startPath, _depth, _callback);
    };
    ContextualFileSystem.prototype.isLocked = function (path, _depth, _callback) {
        this.fs.isLocked(this.context, path, _depth, _callback);
    };
    ContextualFileSystem.prototype.serializer = function () {
        return this.fs.serializer();
    };
    ContextualFileSystem.prototype.serialize = function (callback) {
        this.fs.serialize(callback);
    };
    return ContextualFileSystem;
}());
exports.ContextualFileSystem = ContextualFileSystem;
