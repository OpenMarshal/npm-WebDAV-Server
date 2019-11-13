"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createFiles_1.starter(server, info, isValid, 'hybrid', 0, true, function (lock, user1) {
        _createFiles_1.lockResource(server, info, isValid, user1, 'hybrid', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
});
