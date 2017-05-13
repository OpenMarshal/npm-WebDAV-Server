"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function default_1(arg, callback) {
    var methods = Object
        .keys(arg.server.methods)
        .map(function (s) { return s.toUpperCase(); })
        .join(',');
    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
    arg.response.setHeader('Allow', methods);
    callback();
}
exports.default = default_1;
