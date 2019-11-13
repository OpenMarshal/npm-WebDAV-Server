"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(2);
    function test(path) {
        return function (server) {
            info.req({
                url: 'http://localhost:' + server.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, index_js_1.v2.HTTPCodes.NotFound, function () {
                isValid(true);
            });
        };
    }
    _createFiles_1.starter(info.startServer(), info, isValid, 'folder1', index_js_1.v2.HTTPCodes.OK, test('folder1/file2'));
    _createFiles_1.starter(info.startServer(), info, isValid, 'folder1/folder2', index_js_1.v2.HTTPCodes.OK, test('folder1/folder2/file3'));
});
