"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Serialization_1 = require("../../../manager/v2/fileSystem/Serialization");
var VirtualFileSystem_1 = require("../../../manager/v2/instances/VirtualFileSystem");
var PhysicalFileSystem_1 = require("../../../manager/v2/instances/PhysicalFileSystem");
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
    var options = this.options.autoLoad;
    if (!options)
        options = {};
    if (!options.treeFilePath)
        if (!this.options.autoSave || !this.options.autoSave.treeFilePath)
            return callback(new Error('The "treeFilePath" of the "autoLoad" option is not found.'));
        else
            options.treeFilePath = this.options.autoSave.treeFilePath;
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
function autoSave(options) {
    var _this = this;
    if (!options.streamProvider)
        options.streamProvider = function (cb) { return cb(); };
    if (!options.onSaveError)
        options.onSaveError = function () { };
    if (!options.tempTreeFilePath)
        options.tempTreeFilePath = options.treeFilePath + '.tmp';
    var saving = false;
    var saveRequested = false;
    this.afterRequest(function (ctx, next) {
        switch (ctx.request.method.toUpperCase()) {
            case 'PROPPATCH':
            case 'DELETE':
            case 'MKCOL':
            case 'MOVE':
            case 'COPY':
            case 'POST':
            case 'PUT':
                // Avoid concurrent saving
                if (saving) {
                    saveRequested = true;
                    next();
                    return;
                }
                var save_1 = function () {
                    this.save(function (e, data) {
                        if (e) {
                            options.onSaveError(e);
                            next();
                        }
                        else {
                            options.streamProvider(function (inputStream, outputStream) {
                                if (!inputStream)
                                    inputStream = zlib.createGzip();
                                if (!outputStream)
                                    outputStream = inputStream;
                                var fileStream = fs.createWriteStream(options.tempTreeFilePath);
                                outputStream.pipe(fileStream);
                                inputStream.end(JSON.stringify(data), function (e) {
                                    if (e) {
                                        options.onSaveError(e);
                                        next();
                                        return;
                                    }
                                });
                                fileStream.on('close', function () {
                                    fs.unlink(options.treeFilePath, function (e) {
                                        if (e && e.code !== 'ENOENT') {
                                            options.onSaveError(e);
                                            next();
                                            return;
                                        }
                                        fs.rename(options.tempTreeFilePath, options.treeFilePath, function (e) {
                                            if (e)
                                                options.onSaveError(e);
                                            next();
                                        });
                                    });
                                });
                            });
                        }
                    });
                };
                saving = true;
                next = function () {
                    if (saveRequested) {
                        saveRequested = false;
                        save_1.bind(_this)();
                    }
                    else
                        saving = false;
                };
                save_1.bind(_this)();
                break;
            default:
                next();
                break;
        }
    });
}
exports.autoSave = autoSave;
