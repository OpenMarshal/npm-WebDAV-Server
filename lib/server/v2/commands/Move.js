"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var StandardMethods_1 = require("../../../manager/v2/fileSystem/StandardMethods");
var Path_1 = require("../../../manager/v2/Path");
function execute(ctx, methodName, privilegeName, callback) {
    ctx.noBodyExpected(function () {
        ctx.getResource(function (e, r) {
            ctx.checkIfHeader(r, function () {
                //ctx.requirePrivilege([ privilegeName ], r, () => {
                var overwrite = ctx.headers.find('overwrite') === 'T';
                var destination = ctx.headers.find('destination');
                if (!destination) {
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                    return callback();
                }
                var startIndex = destination.indexOf('://');
                if (startIndex !== -1) {
                    destination = destination.substring(startIndex + '://'.length);
                    destination = destination.substring(destination.indexOf('/')); // Remove the hostname + port
                }
                destination = new Path_1.Path(destination);
                if (destination.toString() === ctx.requested.path.toString()) {
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
                    return callback();
                }
                var cb = function (e, overwritten) {
                    if (e) {
                        if (!ctx.setCodeFromError(e))
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                    }
                    else if (overwritten)
                        ctx.setCode(WebDAVRequest_1.HTTPCodes.NoContent);
                    else
                        ctx.setCode(WebDAVRequest_1.HTTPCodes.Created);
                    callback();
                };
                ctx.server.getFileSystem(destination, function (destFs, destRootPath, destSubPath) {
                    if (destFs !== r.fs) {
                        if (methodName === 'move')
                            StandardMethods_1.StandardMethods.standardMove(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                        else
                            StandardMethods_1.StandardMethods.standardCopy(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                    }
                    else {
                        r[methodName](destination, overwrite, cb);
                    }
                });
                //})
            });
        });
    });
}
exports.execute = execute;
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        execute(ctx, 'move', 'canMove', callback);
    };
    default_1.prototype.isValidFor = function (type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
