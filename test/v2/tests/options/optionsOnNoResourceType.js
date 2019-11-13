"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createFiles_1.starter(server, info, isValid, 'noResource', [
        'COPY', 'DELETE', 'LOCK', 'MOVE', 'PROPFIND', 'PROPPATCH', 'UNLOCK'
    ], [
        'GET', 'PUT', 'POST', 'HEAD', 'MKCOL'
    ], function () {
        isValid(true);
    });
});
