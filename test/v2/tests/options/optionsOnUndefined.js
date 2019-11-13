"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createFiles_1.starter(server, info, isValid, 'fileUndefined', [
        'MKCOL', 'PUT', 'POST', 'LOCK'
    ], [
        'GET', 'COPY', 'DELETE', 'HEAD', 'MOVE', 'PROPFIND', 'PROPPATCH', 'UNLOCK'
    ], function () {
        isValid(true);
    });
});
