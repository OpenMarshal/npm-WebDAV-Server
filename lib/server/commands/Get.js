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
        arg.checkIfHeader(r, function () {
            var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
            arg.requirePrivilege(targetSource ? ['canRead', 'canSource'] : ['canRead'], r, function () {
                r.read(targetSource, function (e, c) { return process.nextTick(function () {
                    if (e)
                        arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                    else {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        if (c.readable) {
                            var rdata = c;
                            var isFirst = true;
                            rdata.on('end', callback);
                            rdata.pipe(arg.response);
                            return;
                        }
                        else {
                            var content = c;
                            if (c === undefined || c === null)
                                content = new Buffer(0);
                            else if (c.constructor === Boolean || c.constructor === Number)
                                content = c.toString();
                            else if (c.constructor === Int8Array)
                                content = new Buffer(c);
                            else
                                content = c;
                            arg.response.write(content);
                        }
                    }
                    callback();
                }); });
            });
        });
    });
}
exports.default = default_1;
