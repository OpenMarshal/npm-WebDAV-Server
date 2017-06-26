"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Serialization_1 = require("../../../manager/v2/fileSystem/Serialization");
var VirtualFileSystem_1 = require("../../../manager/v2/instances/VirtualFileSystem");
var zlib = require("zlib");
var fs = require("fs");
function defaultSerializers() {
    return [
        new VirtualFileSystem_1.VirtualSerializer()
    ];
}
function load(data, serializers, callback) {
    var _this = this;
    serializers = serializers ? serializers : defaultSerializers();
    Serialization_1.unserialize(data, serializers, function (e, udata) {
        _this.fileSystems = udata;
    });
}
exports.load = load;
function autoLoad(callback) {
    var _this = this;
    var options = this.options.autoLoad;
    var oStream = fs.createReadStream(options.treeFilePath);
    var stream = oStream.pipe(zlib.createGunzip());
    oStream.on('error', callback);
    stream.on('error', callback);
    var streamProvider = options.streamProvider;
    if (!streamProvider)
        streamProvider = function (s, cb) { return cb(s); };
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
        options.streamProvider = function (s, cb) { return cb(s); };
    if (!options.onSaveError)
        options.onSaveError = function () { };
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
                            var stream_1 = zlib.createGzip();
                            options.streamProvider(stream_1, function (outputStream) {
                                if (!outputStream)
                                    outputStream = stream_1;
                                outputStream.pipe(fs.createWriteStream(options.tempTreeFilePath));
                                stream_1.end(JSON.stringify(data), function (e) {
                                    if (e) {
                                        options.onSaveError(e);
                                        next();
                                        return;
                                    }
                                });
                                stream_1.on('close', function () {
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
