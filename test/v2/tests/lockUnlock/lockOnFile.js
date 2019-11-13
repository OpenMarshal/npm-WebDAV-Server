"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(2);
    _createFiles_1.starter(server1, info, isValid, 'file', 0, true, function (lock, user1) {
        _createFiles_1.lockResource(server1, info, isValid, user1, 'file', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
    var server2 = info.startServer();
    _createFiles_1.starter(server2, info, isValid, 'file', -1, true, function (lock, user1) {
        _createFiles_1.lockResource(server2, info, isValid, user1, 'file', -1, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
});
