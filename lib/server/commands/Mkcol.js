"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Resource_1 = require("../../resource/Resource");
var path = require("path");
function default_1(arg, callback) {
    arg.server.getResourceFromPath(arg.path.getParent(), function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        if (!r.fsManager) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        var resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), Resource_1.ResourceType.Directory, r);
        resource.create(function (e) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                callback();
                return;
            }
            r.addChild(resource, function (e) {
                if (e)
                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                else
                    arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                callback();
            });
        });
    });
}
exports.default = default_1;
