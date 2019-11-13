"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(2);
    var cx = Buffer.alloc(100000);
    for (var i = 0; i < cx.length; ++i)
        cx.write('X', i, 1, 'utf-8');
    var content = cx.toString();
    _createFileTxt_1.starter(server, info, isValid, cx, function (r) {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, function (res, body) {
            isValid(body === content, 'The content read is not the same as the one written : "' + body.substring(0, 20) + '[...]" but expected "' + content.substring(0, 20) + '[...]".');
        });
    });
    var server2 = info.startServer();
    _createFileTxt_1.starter(server2, info, isValid, cx, function (r) {
        info.req({
            url: 'http://localhost:' + server2.options.port + '/file.txt',
            method: 'HEAD'
        }, function (res) {
            isValid(res.headers['content-length'] === cx.length.toString(), 'The content read is not the same as the one written : "' + cx.length.toString() + '" but expected "' + res.headers['content-length'] + '".');
        });
    });
});
