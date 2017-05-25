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
                resource.create(function (e) { return process.nextTick(function () {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    r.addChild(resource, function (e) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        }
                        else
                            validCallback(resource);
                    }); });
                }); });
            });
        });
    });
}
function unchunkedMethod(arg, callback) {
    var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
    arg.getResource(function (e, r) {
        if (e && e !== Errors_1.Errors.ResourceNotFound) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        arg.checkIfHeader(r, function () {
            if (arg.contentLength === 0) {
                if (r) {
                    arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                        r.write(new Buffer(0), targetSource, function (e) { return process.nextTick(function () {
                            if (e)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            else
                                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            callback();
                        }); });
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
                        r.write(data_1, targetSource, function (e) { return process.nextTick(function () {
                            if (e)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            else
                                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            callback();
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
                        r.write(data_1, targetSource, function (e) { return process.nextTick(function () {
                            if (e)
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            else
                                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                            callback();
                        }); });
                    }); });
                });
            }
        });
    });
}
exports.default = unchunkedMethod;
function asyncWrite(arg, callback, resource, targetSource) {
    function errorCallback(isLast) {
        return function (error) {
            if (error)
                callback(new Errors_1.HTTPError(WebDAVRequest_1.HTTPCodes.InternalServerError, error), null);
            else if (isLast) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                arg.exit();
            }
        };
    }
    callback(null, function (data, isFirst, isLast) {
        if (isFirst)
            resource.write(data, targetSource, errorCallback(isLast));
        else
            resource.append(data, targetSource, errorCallback(isLast));
    });
}
unchunkedMethod.startChunked = function (arg, callback) {
    var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
    arg.getResource(function (e, r) {
        if (e && e !== Errors_1.Errors.ResourceNotFound) {
            callback(new Errors_1.HTTPError(WebDAVRequest_1.HTTPCodes.InternalServerError, e), null);
            return;
        }
        arg.checkIfHeader(r, function () {
            if (arg.contentLength === 0) {
                if (r) {
                    arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                        asyncWrite(arg, callback, r, targetSource);
                    });
                    return;
                }
                createResource(arg, callback, function (r) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                    callback(null, null);
                });
            }
            else {
                if (e) {
                    createResource(arg, callback, function (r) {
                        asyncWrite(arg, callback, r, targetSource);
                    });
                    return;
                }
                arg.requirePrivilege(targetSource ? ['canSource', 'canWrite'] : ['canWrite'], r, function () {
                    r.type(function (e, type) { return process.nextTick(function () {
                        if (e) {
                            callback(new Errors_1.HTTPError(WebDAVRequest_1.HTTPCodes.InternalServerError, e), null);
                            return;
                        }
                        if (!type.isFile) {
                            callback(new Errors_1.HTTPError(WebDAVRequest_1.HTTPCodes.MethodNotAllowed, Errors_1.Errors.ExpectedAFileResourceType), null);
                            return;
                        }
                        asyncWrite(arg, callback, r, targetSource);
                    }); });
                });
            }
        });
    });
};
