"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var FSManager_1 = require("../../../manager/v1/FSManager");
function method(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            arg.checkIfHeader(r, function () {
                arg.requirePrivilege(['canMove'], r, function () {
                    var overwrite = arg.findHeader('overwrite') === 'T';
                    var destination = arg.findHeader('destination');
                    if (!destination) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                        callback();
                        return;
                    }
                    destination = destination.substring(destination.indexOf('://') + '://'.length);
                    destination = destination.substring(destination.indexOf('/'));
                    destination = new FSManager_1.FSPath(destination);
                    arg.server.getResourceFromPath(arg, destination.getParent(), function (e, rDest) {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return;
                        }
                        arg.requirePrivilege(['canAddChild'], rDest, function () {
                            r.moveTo(rDest, destination.fileName(), overwrite, function (e) { return process.nextTick(function () {
                                if (e)
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                else {
                                    arg.invokeEvent('move', r, destination);
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                }
                                callback();
                            }); });
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
