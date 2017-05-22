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
        var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
        arg.requirePrivilege(targetSource ? ['canRead', 'canSource'] : ['canRead'], r, function () {
            r.read(targetSource, function (e, c) {
                if (e)
                    arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                else {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                    var content = c;
                    if (c === undefined || c === null)
                        content = new Buffer(0);
                    else if (c.constructor === Boolean || c.constructor === Number)
                        content = c.toString();
                    else
                        content = c;
                    arg.response.write(content);
                }
                callback();
            });
        });
    });
}
exports.default = default_1;
