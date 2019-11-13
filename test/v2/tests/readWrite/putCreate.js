"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(4);
    var content = 'This is my content!';
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'PUT',
        body: content
    }, index_js_1.v2.HTTPCodes.Created, function () {
        info.req({
            url: 'http://localhost:' + info.port + '/fileUndefined.txt',
            method: 'GET'
        }, function (res, body) {
            isValid(body === content, 'The content read is not the same as the one written : "' + body + '" but expected "' + content + '".');
        });
    });
    _createFileTxt_1.starter(server, info, isValid, content, function () {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt/fileUndefined.txt',
            method: 'PUT',
            body: content
        }, index_js_1.v2.HTTPCodes.Conflict, function () {
            isValid(true);
        });
    });
    info.req({
        url: 'http://localhost:' + info.port + '/folderUndefined/fileUndefined.txt',
        method: 'PUT',
        body: content
    }, index_js_1.v2.HTTPCodes.Conflict, function () {
        isValid(true);
    });
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined2.txt',
        method: 'PUT',
        body: content
    }, index_js_1.v2.HTTPCodes.Created, function () {
        info.req({
            url: 'http://localhost:' + info.port + '/fileUndefined2.txt',
            method: 'PUT',
            body: content
        }, index_js_1.v2.HTTPCodes.OK, function () {
            isValid(true);
        });
    });
});
