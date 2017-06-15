"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function method(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            arg.checkIfHeader(r, function () {
                arg.requirePrivilege(['canDelete'], r, function () {
                    r.delete(function (e) { return process.nextTick(function () {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            arg.invokeEvent('delete', r);
                        }
                        callback();
                    }); });
                });
            });
        });
    });
}
exports.method = method;
method.isValidFor = function (type) {
    return !!type;
};
exports.default = method;
