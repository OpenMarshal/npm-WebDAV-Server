"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Serialization_1 = require("../../../manager/v2/fileSystem/Serialization");
var PhysicalFileSystem_1 = require("../../../manager/v2/instances/PhysicalFileSystem");
var VirtualFileSystem_1 = require("../../../manager/v2/instances/VirtualFileSystem");
var zlib = require("zlib");
var fs = require("fs");
function defaultSerializers() {
    return VirtualFileSystem_1.VirtualSerializerVersions.instances.concat(PhysicalFileSystem_1.PhysicalSerializerVersions.instances);
}
function load(data, serializers, callback) {
    var _this = this;
    var fSerializers = serializers ? serializers.concat(defaultSerializers()) : defaultSerializers();
    Serialization_1.unserialize(data, fSerializers, function (e, udata) {
        if (!e)
            _this.fileSystems = udata;
        callback(e);
    });
}
exports.load = load;
function autoLoad(callback) {
    var _this = this;
    var options = this.options.autoLoad || {};
    if (!options.treeFilePath) {
        if (!this.options.autoSave || !this.options.autoSave.treeFilePath)
            return callback(new Error('The "treeFilePath" of the "autoLoad" option is not found.'));
        else
            options.treeFilePath = this.options.autoSave.treeFilePath;
    }
    var stream = fs.createReadStream(options.treeFilePath);
    stream.on('error', callback);
    var streamProvider = options.streamProvider;
    if (!streamProvider)
        streamProvider = function (s, cb) { return cb(s.pipe(zlib.createGunzip())); };
    streamProvider(stream, function (s) {
        if (!s)
            s = stream;
        var data = '';
        s.on('data', function (chunk) {
            data += chunk.toString();
        });
        s.on('error', callback);
        s.on('end', function () {
            var obj = JSON.parse(data.toString());
            _this.load(obj, options.serializers, callback);
        });
    });
}
exports.autoLoad = autoLoad;
function save(callback) {
    Serialization_1.serialize(this.fileSystems, callback);
}
exports.save = save;
function loadDefaultIAutoSaveParam(options) {
    if (!options.streamProvider)
        options.streamProvider = function (cb) { return cb(); };
    if (!options.onSaveError)
        options.onSaveError = function () { };
    if (!options.tempTreeFilePath)
        options.tempTreeFilePath = options.treeFilePath + '.tmp';
    return options;
}
var AutoSavePool = /** @class */ (function () {
    function AutoSavePool(options, saveFn) {
        options = loadDefaultIAutoSaveParam(options);
        this.saveRequested = false;
        this.options = options;
        this.saveFn = saveFn;
        this.saving = false;
    }
    AutoSavePool.prototype.imediateSave = function () {
        var _this = this;
        this.saveFn(function (e, data) {
            if (e) {
                _this.options.onSaveError(e);
                _this.saveIfNext();
            }
            else {
                _this.options.streamProvider(function (inputStream, outputStream) {
                    if (!inputStream)
                        inputStream = zlib.createGzip();
                    if (!outputStream)
                        outputStream = inputStream;
                    var fileStream = fs.createWriteStream(_this.options.tempTreeFilePath);
                    outputStream.pipe(fileStream);
                    inputStream.end(JSON.stringify(data), function (e) {
                        if (e) {
                            _this.options.onSaveError(e);
                            _this.saveIfNext();
                            return;
                        }
                    });
                    fileStream.on('close', function () {
                        fs.unlink(_this.options.treeFilePath, function (e) {
                            if (e && e.code !== 'ENOENT') // An error other than ENOENT (no file/folder found)
                             {
                                _this.options.onSaveError(e);
                                _this.saveIfNext();
                                return;
                            }
                            fs.rename(_this.options.tempTreeFilePath, _this.options.treeFilePath, function (e) {
                                if (e)
                                    _this.options.onSaveError(e);
                                _this.saveIfNext();
                            });
                        });
                    });
                });
            }
        });
    };
    AutoSavePool.prototype.save = function () {
        if (this.saving) {
            this.saveRequested = true;
        }
        else {
            this.saving = true;
            this.imediateSave();
        }
    };
    AutoSavePool.prototype.saveIfNext = function () {
        if (this.saveRequested) {
            this.saveRequested = false;
            this.imediateSave();
        }
        else {
            this.saving = false;
        }
    };
    return AutoSavePool;
}());
exports.AutoSavePool = AutoSavePool;
function autoSave(options) {
    var _this = this;
    this.autoSavePool = new AutoSavePool(options, this.save.bind(this));
    this.afterRequest(function (ctx, next) {
        switch (ctx.request.method.toUpperCase()) {
            case 'PROPPATCH':
            case 'DELETE':
            case 'MKCOL':
            case 'MOVE':
            case 'COPY':
            case 'POST':
            case 'PUT':
                _this.autoSavePool.save();
                break;
        }
        next();
    });
}
exports.autoSave = autoSave;
