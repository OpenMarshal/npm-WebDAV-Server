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
            arg.checkIfHeader(r, function () {
                var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
                arg.requirePrivilege(targetSource ? ['canRead', 'canSource'] : ['canRead'], r, function () {
                    r.read(targetSource, function (e, rstream) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                            callback();
                        }
                        else {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            rstream.on('end', callback);
                            rstream.pipe(arg.response);
                        }
                    }); });
                });
            });
        });
    });
}
exports.default = default_1;
