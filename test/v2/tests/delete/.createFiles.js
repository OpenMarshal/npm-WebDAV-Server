"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function starter(server, info, isValid, name, expectedStatusCode, callback) {
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
        'file1': index_js_1.v2.ResourceType.File
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        info.req({
            url: 'http://localhost:' + server.options.port + '/' + name,
            method: 'DELETE'
        }, expectedStatusCode, function () {
            if (!callback)
                isValid(true);
            else
                callback(server);
        });
    });
}
exports.starter = starter;
