"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function starter(info, isValid, eventName, callback) {
    var server = info.startServer();
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'emptyFolder1': index_js_1.v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': index_js_1.v2.ResourceType.Directory,
            'file2': index_js_1.v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': index_js_1.v2.ResourceType.Directory,
                'file3': index_js_1.v2.ResourceType.File
            }
        },
        'file1': index_js_1.v2.ResourceType.File,
        'file2': index_js_1.v2.ResourceType.File,
        'file3': index_js_1.v2.ResourceType.File,
        'file4': index_js_1.v2.ResourceType.File,
        'file5': index_js_1.v2.ResourceType.File,
        'file6': index_js_1.v2.ResourceType.File,
        'file7': index_js_1.v2.ResourceType.File,
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        server.on(eventName, function (ctx, fs, path) {
            isValid(true);
        });
        callback(server, server.rootFileSystem());
    });
}
exports.starter = starter;
