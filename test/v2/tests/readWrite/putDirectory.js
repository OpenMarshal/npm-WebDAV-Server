"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFileTxt_1 = require("./.createFileTxt");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createFileTxt_1.starter(server, info, isValid, 'Invalid', index_js_1.v2.ResourceType.Directory, function (r) {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: 'Invalid Content'
        }, index_js_1.v2.HTTPCodes.MethodNotAllowed, function () {
            isValid(true);
        });
    });
});
