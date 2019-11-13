"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
function execute(info, isValid, overwrite) {
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1_moved', overwrite, index_js_1.v2.HTTPCodes.NotFound);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'folder1/file2', overwrite, index_js_1.v2.HTTPCodes.NotFound);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1', overwrite, index_js_1.v2.HTTPCodes.NotFound);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1/file1', overwrite, index_js_1.v2.HTTPCodes.NotFound);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'unmapped/file1', overwrite, index_js_1.v2.HTTPCodes.NotFound);
}
exports.default = (function (info, isValid) {
    var server1 = info.init(5 * 2);
    execute(info, isValid, false);
    execute(info, isValid, true);
});
