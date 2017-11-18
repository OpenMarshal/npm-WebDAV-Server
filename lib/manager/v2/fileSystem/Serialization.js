"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var Workflow_1 = require("../../../helper/Workflow");
function serialize(fileSystems, callback) {
    var result = {};
    new Workflow_1.Workflow()
        .each(Object.keys(fileSystems), function (path, cb) {
        var fs = fileSystems[path];
        var serializer = fs.serializer();
        if (!serializer)
            return cb(); // Skip serialization
        serializer.serialize(fs, function (e, data) {
            if (!e)
                result[path] = {
                    serializer: serializer.uid(),
                    data: data
                };
            cb(e);
        });
    })
        .error(callback)
        .done(function () { return callback(null, result); });
}
exports.serialize = serialize;
function unserialize(serializedData, serializers, callback) {
    var result = {};
    new Workflow_1.Workflow()
        .each(Object.keys(serializedData), function (path, cb) {
        var sd = serializedData[path];
        var serializer = null;
        for (var _i = 0, serializers_1 = serializers; _i < serializers_1.length; _i++) {
            var s = serializers_1[_i];
            if (s.uid() === sd.serializer) {
                serializer = s;
                break;
            }
        }
        if (!serializer)
            return cb(new Errors_1.SerializerNotFound(sd.serializer));
        serializer.unserialize(sd.data, function (e, fs) {
            if (!e)
                result[path] = fs;
            cb(e);
        });
    })
        .error(callback)
        .done(function () { return callback(null, result); });
}
exports.unserialize = unserialize;
