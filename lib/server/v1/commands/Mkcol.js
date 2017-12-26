"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../../resource/v1/IResource");
var Errors_1 = require("../../../Errors");
var path = require("path");
function method(arg, callback) {
    arg.noBodyExpected(function () {
        arg.checkIfHeader(undefined, function () {
            arg.getResource(function (e, r) {
                if (e !== Errors_1.Errors.ResourceNotFound) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                    callback();
                    return;
                }
                arg.server.getResourceFromPath(arg, arg.path.getParent(), function (e, r) {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.Conflict);
                        callback();
                        return;
                    }
                    arg.requirePrivilege(['canAddChild'], r, function () {
                        if (!r.fsManager) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }
                        var resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), IResource_1.ResourceType.Directory, r);
                        arg.requirePrivilege(['canCreate'], resource, function () {
                            resource.create(function (e) { return process.nextTick(function () {
                                if (e) {
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    callback();
                                    return;
                                }
                                arg.invokeEvent('create', resource);
                                r.addChild(resource, function (e) { return process.nextTick(function () {
                                    if (e)
                                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    else {
                                        arg.invokeEvent('addChild', r, resource);
                                        arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                    }
                                    callback();
                                }); });
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
    return !type;
};
exports.default = method;
