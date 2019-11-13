"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function check(server, info, isValid, path, mustExist, callback) {
    info.req({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPFIND',
        headers: {
            Depth: 0
        }
    }, mustExist ? index_js_1.v2.HTTPCodes.MultiStatus : index_js_1.v2.HTTPCodes.NotFound, function () {
        callback();
    });
}
exports.check = check;
function starter(server, info, isValid, method, from, to, overwrite, expectedStatusCode, callback) {
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'emptyFolder1': index_js_1.v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': index_js_1.v2.ResourceType.Directory,
            'file2': index_js_1.v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': index_js_1.v2.ResourceType.Directory,
                'file3': index_js_1.v2.ResourceType.File
            },
            'folder2x': {
                'emptyFolder3x': index_js_1.v2.ResourceType.Directory,
                'file3x': index_js_1.v2.ResourceType.File
            }
        },
        'file1': index_js_1.v2.ResourceType.File
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        info.req({
            url: 'http://localhost:' + server.options.port + '/' + from,
            method: method,
            headers: {
                overwrite: overwrite ? 'T' : 'F',
                destination: '/' + to
            }
        }, expectedStatusCode, function () {
            if (!callback)
                isValid(true);
            else
                callback(server);
        });
    });
}
exports.starter = starter;
