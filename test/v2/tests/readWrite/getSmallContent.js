"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(2);
    var content = 'Hello!!!';
    _createFileTxt_1.starter(server, info, isValid, content, function (r) {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, function (res, body) {
            isValid(body === content, 'The content read is not the same as the one written : "' + body + '" but expected "' + content + '".');
        });
    });
    var server2 = info.startServer();
    _createFileTxt_1.starter(server2, info, isValid, content, function (r) {
        info.req({
            url: 'http://localhost:' + server2.options.port + '/file.txt',
            method: 'HEAD'
        }, function (res) {
            isValid(res.headers['content-length'] === content.length.toString(), 'The content read is not the same as the one written : "' + content.length.toString() + '" but expected "' + res.headers['content-length'] + '".');
        });
    });
});
