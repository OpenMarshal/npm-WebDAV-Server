"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(3);
    _createFiles_1.starter(info.startServer(), info, isValid, 'unmapped/folder', index_js_1.v2.HTTPCodes.Conflict);
    _createFiles_1.starter(info.startServer(), info, isValid, 'unmapped/unmapped/folder', index_js_1.v2.HTTPCodes.Conflict);
    _createFiles_1.starter(info.startServer(), info, isValid, 'unmapped', index_js_1.v2.HTTPCodes.Created, function (server) {
        info.req({
            url: 'http://localhost:' + server.options.port + '/unmapped',
            method: 'PROPFIND',
            headers: {
                Depth: 0
            }
        }, index_js_1.v2.HTTPCodes.MultiStatus, function () {
            isValid(true);
        });
    });
});
