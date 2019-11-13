"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var export_1 = require("../fileSystem/export");
var stream_1 = require("stream");
var JSCompatibility_1 = require("../../../helper/JSCompatibility");
var Errors_1 = require("../../../Errors");
var Path_1 = require("../Path");
var VirtualFileSystemResource = /** @class */ (function () {
    function VirtualFileSystemResource(data) {
        var rs;
        if (data && data.isFile !== undefined && data.isDirectory !== undefined) {
            rs = {
                type: data
            };
        }
        else {
            rs = data;
        }
        this.lastModifiedDate = rs.lastModifiedDate ? rs.lastModifiedDate : Date.now();
        this.creationDate = rs.creationDate ? rs.creationDate : Date.now();
        this.content = rs.content ? rs.content.map(function (o) { return Buffer.from(o); }) : [];
        this.props = new export_1.LocalPropertyManager(rs.props);
        this.locks = new export_1.LocalLockManager();
        this.size = rs.size ? rs.size : 0;
        this.type = rs.type ? rs.type : export_1.ResourceType.File;
    }
    VirtualFileSystemResource.updateLastModified = function (r) {
        r.lastModifiedDate = Date.now();
    };
    return VirtualFileSystemResource;
}());
exports.VirtualFileSystemResource = VirtualFileSystemResource;
var VirtualFileReadable = /** @class */ (function (_super) {
    __extends(VirtualFileReadable, _super);
    function VirtualFileReadable(contents) {
        var _this = _super.call(this) || this;
        _this.contents = contents;
        _this.blockIndex = -1;
        return _this;
    }
    VirtualFileReadable.prototype._read = function (size) {
        while (true) {
            ++this.blockIndex;
            if (this.blockIndex >= this.contents.length) {
                this.push(null);
                break;
            }
            if (!this.push(this.contents[this.blockIndex]))
                break;
        }
    };
    return VirtualFileReadable;
}(stream_1.Readable));
exports.VirtualFileReadable = VirtualFileReadable;
var VirtualFileWritable = /** @class */ (function (_super) {
    __extends(VirtualFileWritable, _super);
    function VirtualFileWritable(contents) {
        var _this = _super.call(this, null) || this;
        _this.contents = contents;
        return _this;
    }
    VirtualFileWritable.prototype._write = function (chunk, encoding, callback) {
        this.contents.push(chunk);
        callback(null);
    };
    return VirtualFileWritable;
}(stream_1.Writable));
exports.VirtualFileWritable = VirtualFileWritable;
var VirtualSerializer = /** @class */ (function () {
    function VirtualSerializer() {
    }
    VirtualSerializer.prototype.uid = function () {
        return 'VirtualFSSerializer-1.0.0';
    };
    VirtualSerializer.prototype.serialize = function (fs, callback) {
        callback(null, {
            resources: fs.resources
        });
    };
    VirtualSerializer.prototype.unserialize = function (serializedData, callback) {
        // tslint:disable-next-line:no-use-before-declare
        var fs = new VirtualFileSystem();
        if (serializedData.resources) {
            for (var path in serializedData.resources)
                fs.resources[path] = new VirtualFileSystemResource(serializedData.resources[path]);
        }
        else {
            for (var path in serializedData)
                fs.resources[path] = new VirtualFileSystemResource(serializedData[path]);
        }
        callback(null, fs);
    };
    return VirtualSerializer;
}());
exports.VirtualSerializer = VirtualSerializer;
exports.VirtualSerializerVersions = {
    versions: {
        '1.0.0': VirtualSerializer
    },
    instances: [
        new VirtualSerializer()
    ]
};
var VirtualFileSystem = /** @class */ (function (_super) {
    __extends(VirtualFileSystem, _super);
    function VirtualFileSystem(serializer) {
        var _this = _super.call(this, serializer ? serializer : new VirtualSerializer()) || this;
        _this.resources = {
            '/': new VirtualFileSystemResource(export_1.ResourceType.Directory)
        };
        return _this;
    }
    VirtualFileSystem.prototype._fastExistCheck = function (ctx, path, callback) {
        callback(this.resources[path.toString()] !== undefined);
    };
    VirtualFileSystem.prototype._create = function (path, ctx, callback) {
        this.resources[path.toString()] = new VirtualFileSystemResource(ctx.type);
        callback();
    };
    VirtualFileSystem.prototype._delete = function (path, ctx, callback) {
        var sPath = path.toString(true);
        for (var path_1 in this.resources) {
            if (JSCompatibility_1.startsWith(path_1, sPath))
                delete this.resources[path_1];
        }
        delete this.resources[path.toString()];
        callback();
    };
    VirtualFileSystem.prototype._openWriteStream = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (resource === undefined)
            return callback(Errors_1.Errors.ResourceNotFound);
        var content = [];
        var stream = new VirtualFileWritable(content);
        stream.on('finish', function () {
            resource.content = content;
            resource.size = content.map(function (c) { return c.length; }).reduce(function (s, n) { return s + n; }, 0);
            VirtualFileSystemResource.updateLastModified(resource);
        });
        callback(null, stream);
    };
    VirtualFileSystem.prototype._openReadStream = function (path, ctx, callback) {
        var resource = this.resources[path.toString()];
        if (resource === undefined)
            return callback(Errors_1.Errors.ResourceNotFound);
        callback(null, new VirtualFileReadable(resource.content));
    };
    VirtualFileSystem.prototype._size = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'size', callback);
    };
    VirtualFileSystem.prototype._lockManager = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'locks', callback);
    };
    VirtualFileSystem.prototype._propertyManager = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'props', callback);
    };
    VirtualFileSystem.prototype._readDir = function (path, ctx, callback) {
        var base = path.toString(true);
        var children = [];
        for (var subPath in this.resources) {
            if (JSCompatibility_1.startsWith(subPath, base)) {
                var pSubPath = new Path_1.Path(subPath);
                if (pSubPath.paths.length === path.paths.length + 1)
                    children.push(pSubPath);
            }
        }
        callback(null, children);
    };
    /**
     * Get a property of an existing resource (object property, not WebDAV property). If the resource doesn't exist, it is created.
     *
     * @param path Path of the resource
     * @param ctx Context of the method
     * @param propertyName Name of the property to get from the resource
     * @param callback Callback returning the property object of the resource
     */
    VirtualFileSystem.prototype.getPropertyFromResource = function (path, ctx, propertyName, callback) {
        var resource = this.resources[path.toString()];
        if (!resource)
            return callback(Errors_1.Errors.ResourceNotFound);
        callback(null, resource[propertyName]);
    };
    VirtualFileSystem.prototype._creationDate = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'creationDate', callback);
    };
    VirtualFileSystem.prototype._lastModifiedDate = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'lastModifiedDate', callback);
    };
    VirtualFileSystem.prototype._type = function (path, ctx, callback) {
        this.getPropertyFromResource(path, ctx, 'type', callback);
    };
    return VirtualFileSystem;
}(export_1.FileSystem));
exports.VirtualFileSystem = VirtualFileSystem;
