"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualStoredFolder_1 = require("../resource/virtualStored/VirtualStoredFolder");
var VirtualStoredFile_1 = require("../resource/virtualStored/VirtualStoredFile");
var Errors_1 = require("../Errors");
var path = require("path");
var fs = require("fs");
var VirtualStoredContentManager = (function () {
    function VirtualStoredContentManager() {
    }
    VirtualStoredContentManager.prototype.allocate = function (options, callback) {
        var _options;
        var _callback;
        if (options.constructor === Function) {
            _options = {};
            _callback = options;
        }
        else {
            _options = options;
            _callback = callback;
        }
        this._allocate(_options, _callback);
    };
    return VirtualStoredContentManager;
}());
exports.VirtualStoredContentManager = VirtualStoredContentManager;
var SimpleVirtualStoredContentManager = (function (_super) {
    __extends(SimpleVirtualStoredContentManager, _super);
    function SimpleVirtualStoredContentManager(storeFolderPath) {
        var _this = _super.call(this) || this;
        _this.storeFolderPath = storeFolderPath;
        _this.initialized = false;
        _this.uid = "SimpleVirtualStoredContentManager_1.3.3";
        _this.cid = 0;
        return _this;
    }
    SimpleVirtualStoredContentManager.prototype.initialize = function (callback) {
        var _this = this;
        fs.readdir(this.storeFolderPath, function (e, files) {
            if (e) {
                process.nextTick(function () { return callback(e); });
                return;
            }
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                try {
                    var value = parseInt(file, 16);
                    if (value && _this.cid < value)
                        _this.cid = value;
                }
                catch (ex) { }
            }
            _this.initialized = true;
            process.nextTick(function () { return callback(null); });
        });
    };
    SimpleVirtualStoredContentManager.prototype.read = function (contentUid, _callback) {
        var callback = function (_1, _2) { return process.nextTick(function () { return _callback(_1, _2); }); };
        fs.open(path.join(this.storeFolderPath, contentUid), 'r', function (e, fd) {
            if (e)
                callback(e, null);
            else
                callback(null, fs.createReadStream(null, { fd: fd }));
        });
    };
    SimpleVirtualStoredContentManager.prototype.write = function (contentUid, _callback) {
        var callback = function (_1, _2) { return process.nextTick(function () { return _callback(_1, _2); }); };
        fs.open(path.join(this.storeFolderPath, contentUid), 'w', function (e, fd) {
            if (e)
                callback(e, null);
            else
                callback(null, fs.createWriteStream(null, { fd: fd }));
        });
    };
    SimpleVirtualStoredContentManager.prototype._allocate = function (options, _callback) {
        var callback = function (_1, _2) { return process.nextTick(function () { return _callback(_1, _2); }); };
        if (!this.initialized) {
            callback(new Error('SimpleVirtualStoredContentManager not initialized'), null);
            return;
        }
        var uid = (++this.cid).toString(16);
        fs.open(path.join(this.storeFolderPath, uid), 'w+', function (e, fd) {
            if (e)
                callback(e, null);
            else
                fs.close(fd, function (e) {
                    callback(e, uid);
                });
        });
    };
    return SimpleVirtualStoredContentManager;
}(VirtualStoredContentManager));
exports.SimpleVirtualStoredContentManager = SimpleVirtualStoredContentManager;
var VirtualStoredFSManager = (function () {
    function VirtualStoredFSManager(contentManager) {
        this.contentManager = contentManager;
        this.uid = 'VirtualStoredFSManager_1.3.3_' + contentManager.uid;
    }
    VirtualStoredFSManager.prototype.initialize = function (callback) {
        this.contentManager.initialize(callback);
    };
    VirtualStoredFSManager.prototype.serialize = function (resource, obj) {
        var result = {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        };
        result.name = resource.name;
        if (resource.len)
            result.len = resource.len;
        return result;
    };
    VirtualStoredFSManager.prototype.unserialize = function (data, obj) {
        if (obj.type.isDirectory) {
            var rs = new VirtualStoredFolder_1.VirtualStoredFolder(data.name, null, this);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }
        if (obj.type.isFile) {
            var rs = new VirtualStoredFile_1.VirtualStoredFile(data.name, null, this);
            if (data.len)
                rs.len = data.len;
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.lockBag.locks = data.locks;
            rs.properties = data.properties;
            return rs;
        }
        throw Errors_1.Errors.UnrecognizedResource;
    };
    VirtualStoredFSManager.prototype.newResource = function (fullPath, name, type, parent) {
        if (type.isDirectory)
            return new VirtualStoredFolder_1.VirtualStoredFolder(name, parent, this);
        if (type.isFile)
            return new VirtualStoredFile_1.VirtualStoredFile(name, parent, this);
        throw Errors_1.Errors.UnrecognizedResource;
    };
    return VirtualStoredFSManager;
}());
exports.VirtualStoredFSManager = VirtualStoredFSManager;
