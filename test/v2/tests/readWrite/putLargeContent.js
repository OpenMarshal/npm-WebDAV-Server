"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    var cx = Buffer.alloc(100000);
    for (var i = 0; i < cx.length; ++i)
        cx.write('X', i, 1, 'utf-8');
    var content = cx.toString();
    _createFileTxt_1.starter(server, info, isValid, 'NO CONTENT', function (r) {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: content
        }, function (res, body) {
            r.openReadStream(function (e, rStream) {
                if (e)
                    return isValid(false, 'Could not open the resource for reading.', e);
                var data = '';
                var tempData;
                while (tempData = rStream.read(1000))
                    data += tempData.toString();
                isValid(data === content, 'The content read is not the same as the one written : "' + data.substring(0, 20) + '[...]" but expected "' + content.substring(0, 20) + '[...]".');
            });
        });
    });
});
