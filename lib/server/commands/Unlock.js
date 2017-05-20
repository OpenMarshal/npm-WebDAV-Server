"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function default_1(arg, callback) {
    if (!arg.user) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.Unauthorized);
        callback();
        return;
    }
    var token = arg.findHeader('Lock-Token');
    if (!token) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
        callback();
        return;
    }
    token = token.replace('<', '').replace('>', '').trim();
    arg.response.setHeader('Lock-Token', '<' + token + '>');
    arg.getResource(function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        r.getLock(token, function (e, lock) {
            if (e || !lock) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                callback();
                return;
            }
            if (lock.user !== arg.user) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                callback();
                return;
            }
            r.removeLock(lock.uuid, function (e, done) {
                if (e || !done)
                    arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                else
                    arg.setCode(WebDAVRequest_1.HTTPCodes.NoContent);
                callback();
            });
        });
    });
}
exports.default = default_1;
