"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../resource/IResource");
var path = require("path");
function default_1(arg, callback) {
    arg.checkIfHeader(undefined, function () {
        arg.server.getResourceFromPath(arg.path.getParent(), function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
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
                        r.addChild(resource, function (e) { return process.nextTick(function () {
                            if (e)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            else
                                arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                            callback();
                        }); });
                    }); });
                });
            });
        });
    });
}
exports.default = default_1;
