"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server = info.init(3);
    _createFiles_1.starter(server, info, isValid, 'fileUndefined', 0, true, index_js_1.v2.HTTPCodes.Created, function (lock, user1) {
        _createFiles_1.lockResource(server, info, isValid, user1, 'fileUndefined', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'folderUndefined/fileUndefined', 0, true, index_js_1.v2.HTTPCodes.Conflict, function (lock) {
        isValid(true);
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'file/subFile', 0, true, index_js_1.v2.HTTPCodes.Conflict, function (lock) {
        isValid(true);
    });
});
