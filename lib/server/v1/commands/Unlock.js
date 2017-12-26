"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var LockScope_1 = require("../../../resource/v1/lock/LockScope");
var LockKind_1 = require("../../../resource/v1/lock/LockKind");
var LockType_1 = require("../../../resource/v1/lock/LockType");
var Errors_1 = require("../../../Errors");
var Lock_1 = require("../../../resource/v1/lock/Lock");
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
                        if (e !== Errors_1.Errors.MustIgnore) {
                            if (e || !lock) {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                                callback();
                                return;
                            }
                            if (!!lock.userUid && lock.userUid !== arg.user.uid) {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                                callback();
                                return;
                            }
                        }
                        else {
                            lock = new Lock_1.Lock(new LockKind_1.LockKind(LockScope_1.LockScope.Exclusive, LockType_1.LockType.Write), undefined, undefined);
                            lock.uuid = token;
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
