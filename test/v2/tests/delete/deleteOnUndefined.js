"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(1);
    _createFiles_1.starter(info.startServer(), info, isValid, 'fileUndefined', index_js_1.v2.HTTPCodes.NotFound);
});
