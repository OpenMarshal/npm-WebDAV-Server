"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function default_1(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
            arg.checkIfHeader(r, function () {
                arg.requirePrivilege(targetSource ? ['canRead', 'canSource'] : ['canRead'], r, function () {
                    r.type(function (e, type) {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else if (!type.isFile)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                        else
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        callback();
                    });
                });
            });
        });
    });
}
exports.default = default_1;
