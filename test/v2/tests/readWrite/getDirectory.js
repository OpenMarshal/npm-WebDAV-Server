"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(2);
    _createFileTxt_1.starter(server, info, isValid, 'Invalid', index_js_1.v2.ResourceType.Directory, function (r) {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, index_js_1.v2.HTTPCodes.MethodNotAllowed, function () {
            isValid(true);
        });
    });
    var server2 = info.startServer();
    _createFileTxt_1.starter(server2, info, isValid, 'Invalid', index_js_1.v2.ResourceType.Directory, function (r) {
        info.req({
            url: 'http://localhost:' + server2.options.port + '/file.txt',
            method: 'HEAD'
        }, index_js_1.v2.HTTPCodes.MethodNotAllowed, function () {
            isValid(true);
        });
    });
});
