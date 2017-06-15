"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
function method(arg, callback) {
    if (!arg.user) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
        callback();
        return;
    }
    arg.noBodyExpected(function () {
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
            arg.checkIfHeader(r, function () {
                arg.requireErPrivilege(['canGetLock', 'canRemoveLock'], r, function (e, can) {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    if (!can) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                        callback();
                        return;
                    }
                    r.getLock(token, function (e, lock) {
                        if (e || !lock) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                            callback();
                            return;
                        }
                        if (lock.userUid !== arg.user.uid) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                            callback();
                            return;
                        }
                        r.removeLock(lock.uuid, function (e, done) {
                            if (e || !done)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                            else {
                                arg.invokeEvent('unlock', r, lock);
                                arg.setCode(WebDAVRequest_1.HTTPCodes.NoContent);
                            }
                            callback();
                        });
                    });
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
