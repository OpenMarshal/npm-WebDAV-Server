"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function default_1(arg, callback) {
    arg.getResource(function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        r.read(function (e, c) {
            if (e)
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            else {
                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                arg.response.write(c ? c : new Buffer(0));
            }
            callback();
        });
    });
}
exports.default = default_1;
