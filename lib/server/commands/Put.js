"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Resource_1 = require("../../resource/Resource");
var path = require("path");
function createResource(arg, callback, validCallback) {
    arg.server.getResourceFromPath(arg.path.getParent(), function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
            callback();
            return;
        }
        if (!r.fsManager) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        var resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), Resource_1.ResourceType.File, r);
        resource.create(function (e) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                callback();
                return;
            }
            r.addChild(resource, function (e) {
                if (e) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                    callback();
                }
                else
                    validCallback(resource);
            });
        });
    });
}
function default_1(arg, callback) {
    arg.getResource(function (e, r) {
        if (arg.contentLength === 0) {
            if (r) {
                r.write(new Buffer(0), function (e) {
                    if (e)
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                    else
                        arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                    callback();
                });
                return;
            }
            createResource(arg, callback, function (r) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                callback();
            });
        }
        else {
            var data = new Buffer(arg.data);
            if (e) {
                createResource(arg, callback, function (r) {
                    r.write(data, function (e) {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        callback();
                    });
                });
                return;
            }
            r.write(data, function (e) {
                if (e)
                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                else
                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                callback();
            });
        }
    });
}
exports.default = default_1;
