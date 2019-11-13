"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(6);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1x', false, index_js_1.v2.HTTPCodes.Created, function (s) {
        _createFiles_1.check(s, info, isValid, 'folder1', true, function () {
            _createFiles_1.check(s, info, isValid, 'folder1x', true, function () {
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1/folder2x', 'folder1/folder2', false, index_js_1.v2.HTTPCodes.PreconditionFailed);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1/folder2x', 'folder1/folder2', true, index_js_1.v2.HTTPCodes.NoContent, function (s) {
        _createFiles_1.check(s, info, isValid, 'folder1/folder2x', true, function () {
            _createFiles_1.check(s, info, isValid, 'folder1/folder2', true, function () {
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1', false, index_js_1.v2.HTTPCodes.Forbidden);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1/folder1', false, index_js_1.v2.HTTPCodes.BadGateway);
    _createFiles_1.starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'unmapped/folder1', false, index_js_1.v2.HTTPCodes.Conflict);
});
