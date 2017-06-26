"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Errors_1 = require("../../../Errors");
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        if (!ctx.user) {
            ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
            callback();
            return;
        }
        ctx.noBodyExpected(function () {
            var token = ctx.headers.find('Lock-Token');
            if (!token) {
                ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                callback();
                return;
            }
            token = token.replace('<', '').replace('>', '').trim();
            ctx.response.setHeader('Lock-Token', '<' + token + '>');
            ctx.getResource(function (e, r) {
                ctx.checkIfHeader(r, function () {
                    /*ctx.requireErPrivilege([ 'canGetLock', 'canRemoveLock' ], r, (e, can) => {
                        if(e)
                        {
                            ctx.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }

                        if(!can)
                        {
                            ctx.setCode(HTTPCodes.Forbidden);
                            callback();
                            return;
                        }*/
                    r.lockManager(function (e, lm) {
                        if (e) {
                            ctx.setCode(e === Errors_1.Errors.ResourceNotFound ? WebDAVRequest_1.HTTPCodes.NotFound : WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return callback();
                        }
                        lm.getLock(token, function (e, lock) {
                            if (e || !lock) {
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                                return callback();
                            }
                            if (!!lock.userUid && lock.userUid !== ctx.user.uid) {
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                                return callback();
                            }
                            lm.removeLock(lock.uuid, function (e, done) {
                                if (e || !done)
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                                else {
                                    //ctx.invokeEvent('unlock', r, lock);
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.NoContent);
                                }
                                callback();
                            });
                        });
                    });
                    //})
                });
            });
        });
    };
    default_1.prototype.isValidFor = function (type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
