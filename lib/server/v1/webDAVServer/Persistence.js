"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var export_1 = require("../../../manager/v1/export");
var ISerializer_1 = require("../../../manager/v1/ISerializer");
var zlib = require("zlib");
var fs = require("fs");
function defaultFSManagers() {
    return [
        new export_1.RootFSManager(),
        new export_1.VirtualFSManager(),
        new export_1.PhysicalFSManager()
    ];
}
function load(obj, managers, callback) {
    var _this = this;
    ISerializer_1.unserialize(obj, managers ? managers : defaultFSManagers(), function (e, r) {
        if (!e) {
            _this.rootResource = r;
            callback(null);
        }
        else
            callback(e);
    });
}
exports.load = load;
function autoLoad(callback) {
    var _this = this;
    var oStream = fs.createReadStream(this.options.autoLoad.treeFilePath);
    var stream = oStream.pipe(zlib.createGunzip());
    oStream.on('error', callback);
    stream.on('error', callback);
    var streamProvider = this.options.autoLoad.streamProvider;
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
            var fsManagers = _this.options.autoLoad.fsManagers;
            _this.load(obj, fsManagers ? fsManagers : defaultFSManagers(), callback);
        });
    });
}
exports.autoLoad = autoLoad;
function save(callback) {
    ISerializer_1.serialize(this.rootResource, callback);
}
exports.save = save;
