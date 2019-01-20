"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../../resource/v1/IResource");
var Errors_1 = require("../../../Errors");
var path = require("path");
function createResource(arg, callback, validCallback) {
    arg.server.getResourceFromPath(arg, arg.path.getParent(), function (e, r) {
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
                resource.create(function (e) { return process.nextTick(function () {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    arg.invokeEvent('create', resource);
                    r.addChild(resource, function (e) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        }
                        else {
                            arg.invokeEvent('addChild', r, resource);
                            validCallback(resource);
                        }
                    }); });
                }); });
            });
        });
    });
}
function unchunkedMethod(arg, callback) {
    var targetSource = arg.isSource;
    arg.getResource(function (e, r) {
        if (e && e !== Errors_1.Errors.ResourceNotFound) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        arg.checkIfHeader(r, function () {
            if (arg.contentLength === 0) { // Create file
                if (r) { // Resource exists => empty it
                    arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                        r.write(targetSource, function (e, stream) { return process.nextTick(function () {
                            if (stream)
                                stream.end();
                            if (e)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            else {
                                arg.invokeEvent('write', r);
                                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            }
                            callback();
                        }); }, arg.contentLength);
                    });
                    return;
                }
                createResource(arg, callback, function (r) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                    callback();
                });
            }
            else { // Write to a file
                if (e) { // Resource not found
                    createResource(arg, callback, function (r) {
                        r.write(targetSource, function (e, stream) { return process.nextTick(function () {
                            if (e) {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            stream.end(arg.data, function (e) {
                                if (e)
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                else {
                                    arg.invokeEvent('write', r);
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                }
                                callback();
                            });
                        }); });
                    });
                    return;
                }
                arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                    r.type(function (e, type) { return process.nextTick(function () {
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
                        r.write(targetSource, function (e, stream) { return process.nextTick(function () {
                            if (e) {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            stream.end(arg.data, function (e) {
                                if (e)
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                else {
                                    arg.invokeEvent('write', r);
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                }
                                callback();
                            });
                        }); }, arg.contentLength);
                    }); });
                });
            }
        });
    });
}
exports.default = unchunkedMethod;
unchunkedMethod.isValidFor = function (type) {
    return !type || type.isFile;
};
unchunkedMethod.chunked = function (arg, callback) {
    var targetSource = arg.isSource;
    arg.getResource(function (e, r) {
        if (e && e !== Errors_1.Errors.ResourceNotFound) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        arg.checkIfHeader(r, function () {
            if (e) { // Resource not found
                createResource(arg, callback, function (r) {
                    r.write(targetSource, function (e, stream) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }
                        arg.request.pipe(stream);
                        stream.on('finish', function () {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                            arg.invokeEvent('write', r);
                            callback();
                        });
                        stream.on('error', function (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        });
                    }); }, arg.contentLength);
                });
                return;
            }
            arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                r.type(function (e, type) { return process.nextTick(function () {
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
                    r.write(targetSource, function (e, stream) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }
                        arg.request.pipe(stream);
                        stream.on('finish', function (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            arg.invokeEvent('write', r);
                            callback();
                        });
                        stream.on('error', function (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        });
                    }); }, arg.contentLength);
                }); });
            });
        });
    });
};
