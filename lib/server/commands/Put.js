"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../resource/IResource");
var Errors_1 = require("../../Errors");
var path = require("path");
function createResource(arg, callback, validCallback) {
    arg.server.getResourceFromPath(arg.path.getParent(), function (e, r) {
        if (e) {
            arg.setCode(e === Errors_1.Errors.ResourceNotFound ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        if (!r.fsManager) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        arg.requirePrivilege(['canAddChild'], r, function () {
            var resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), IResource_1.ResourceType.File, r);
            arg.requirePrivilege(['canCreate', 'canWrite'], resource, function () {
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
        });
    });
}
function default_1(arg, callback) {
    var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
    arg.getResource(function (e, r) {
        if (e && e !== Errors_1.Errors.ResourceNotFound) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        if (arg.contentLength === 0) {
            if (r) {
                arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                    r.write(new Buffer(0), targetSource, function (e) {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        callback();
                    });
                });
                return;
            }
            createResource(arg, callback, function (r) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                callback();
            });
        }
        else {
            var data_1 = new Buffer(arg.data);
            if (e) {
                createResource(arg, callback, function (r) {
                    r.write(data_1, targetSource, function (e) {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        callback();
                    });
                });
                return;
            }
            arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                r.type(function (e, type) {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    if (!type.isFile) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                        callback();
                        return;
                    }
                    r.write(data_1, targetSource, function (e) {
                        if (e)
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        else
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                        callback();
                    });
                });
            });
        }
    });
}
exports.default = default_1;
