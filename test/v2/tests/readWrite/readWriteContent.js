"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    var content = 'Hello!!!';
    _createFileTxt_1.starter(server, info, isValid, content, function (r) {
        r.openReadStream(function (e, rStream) {
            if (e)
                return isValid(false, 'Could not open the resource for reading.', e);
            var data = rStream.read(1000).toString();
            isValid(data === content, 'The content read is not the same as the one written : "' + data + '" but expected "' + content + '".');
        });
    });
});
