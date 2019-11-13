"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    _createFiles_1.methodTesterNotBlocking(info, isValid, function (port, user2, cb) {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'HEAD',
            headers: {
                Authorization: 'Basic ' + user2
            }
        }, index_js_1.v2.HTTPCodes.OK, function () {
            cb();
        });
    });
});
