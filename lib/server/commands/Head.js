"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Get_1 = require("./Get");
function method(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            var targetSource = arg.isSource;
            arg.checkIfHeader(r, function () {
                arg.requirePrivilege(targetSource ? ['canRead', 'canSource', 'canGetMimeType'] : ['canRead', 'canGetMimeType'], r, function () {
                    r.type(function (e, type) {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }
                        if (!type.isFile) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                            callback();
                            return;
                        }
                        r.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                            if (e) {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            r.size(targetSource, function (e, size) {
                                if (e)
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                else {
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                    arg.response.setHeader('Accept-Ranges', 'bytes');
                                    arg.response.setHeader('Content-Type', mimeType);
                                    arg.response.setHeader('Content-Length', size.toString());
                                    callback();
                                }
                            });
                        }); });
                    });
                });
            });
        });
    });
}
exports.method = method;
method.isValidFor = Get_1.default.isValidFor;
exports.default = method;
