"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function starter(server, info, isValid, content, _type, _callback) {
    var _a;
    var callback = _callback ? _callback : _type;
    var type = _callback ? _type : index_js_1.v2.ResourceType.File;
    var name = 'file.txt';
    var ctx = index_js_1.v2.ExternalRequestContext.create(server);
    server.rootFileSystem().addSubTree(ctx, (_a = {},
        _a[name] = type,
        _a), function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        server.getResource(ctx, '/' + name, function (e, r) {
            if (e)
                return isValid(false, 'Could not find //' + name, e);
            if (!type.isFile)
                return callback(r, server);
            r.openWriteStream(function (e, wStream) {
                if (e)
                    return isValid(false, 'Could not open the resource for writing.', e);
                wStream.end(content, function (e) {
                    if (e)
                        return isValid(false, 'Could not write content to the resource.', e);
                    callback(r, server);
                });
            });
        });
    });
}
exports.starter = starter;
