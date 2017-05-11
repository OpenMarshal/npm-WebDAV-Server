"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function default_1(arg, callback) {
    arg.setCode(WebDAVRequest_1.HTTPCodes.NotImplemented);
    callback();
}
exports.default = default_1;
