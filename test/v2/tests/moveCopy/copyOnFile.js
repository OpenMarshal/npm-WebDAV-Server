"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(6);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1_moved', false, index_js_1.v2.HTTPCodes.Created, function (s) {
        _createFiles_1.check(s, info, isValid, 'file1', true, function () {
            _createFiles_1.check(s, info, isValid, 'file1_moved', true, function () {
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'folder1/file2', false, index_js_1.v2.HTTPCodes.PreconditionFailed);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'folder1/file2', true, index_js_1.v2.HTTPCodes.NoContent, function (s) {
        _createFiles_1.check(s, info, isValid, 'file1', true, function () {
            _createFiles_1.check(s, info, isValid, 'folder1/file2', true, function () {
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1', false, index_js_1.v2.HTTPCodes.Forbidden);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1/file1', false, index_js_1.v2.HTTPCodes.BadGateway);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'file1', 'unmapped/file1', false, index_js_1.v2.HTTPCodes.Conflict);
});
