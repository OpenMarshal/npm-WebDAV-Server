"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
exports.default = (function (info, isValid) {
    var server = info.init(2);
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'GET'
    }, index_js_1.v2.HTTPCodes.NotFound, function () {
        isValid(true);
    });
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'HEAD'
    }, index_js_1.v2.HTTPCodes.NotFound, function () {
        isValid(true);
    });
});
