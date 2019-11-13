"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFiles_1 = require("./.createFiles");
var _test_1 = require("./.test");
exports.default = (function (info, isValid) {
    info.init(1);
    _createFiles_1.starter(info, isValid, function (s) {
        _test_1.test(s, info, isValid, 'folder');
    });
});
