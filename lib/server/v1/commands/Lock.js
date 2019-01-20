"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../../resource/v1/IResource");
var IfParser_1 = require("../../../helper/v1/IfParser");
var LockScope_1 = require("../../../resource/v1/lock/LockScope");
var LockKind_1 = require("../../../resource/v1/lock/LockKind");
var LockType_1 = require("../../../resource/v1/lock/LockType");
var Errors_1 = require("../../../Errors");
var Lock_1 = require("../../../resource/v1/lock/Lock");
var xml_js_builder_1 = require("xml-js-builder");
var path = require("path");
function createResponse(arg, lock) {
    var prop = new xml_js_builder_1.XMLElementBuilder('D:prop', {
        'xmlns:D': 'DAV:'
    });
    var activelock = prop.ele('D:lockdiscovery').ele('D:activelock');
    activelock.ele('D:locktype').ele(lock.lockKind.type.value);
    activelock.ele('D:lockscope').ele(lock.lockKind.scope.value);
    activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid);
    activelock.ele('D:lockroot').add(arg.fullUri());
    activelock.ele('D:depth').add('infinity');
    if (lock.owner)
        activelock.ele('D:owner').add(lock.owner);
    activelock.ele('D:timeout').add('Second-' + lock.lockKind.timeout);
    return prop;
}
function createLock(arg, callback) {
    try {
        var xml = xml_js_builder_1.XML.parse(arg.data);
        var root = xml.find('DAV:lockinfo');
        var scope = new LockScope_1.LockScope(root.find('DAV:lockscope').elements[0].name.substr(4).toLowerCase());
        var type = new LockType_1.LockType(root.find('DAV:locktype').elements[0].name.substr(4).toLowerCase());
        var ownerElement = root.find('DAV:owner');
        var owner = ownerElement ? ownerElement.elements : null;
        var lock_1 = new Lock_1.Lock(new LockKind_1.LockKind(scope, type, arg.server.options.lockTimeout), arg.user, owner);
        arg.getResource(function (e, r) {
            if (e === Errors_1.Errors.ResourceNotFound) { // create the resource
                arg.checkIfHeader(undefined, function () {
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
                                    r.addChild(resource, function (e) {
                                        if (e) {
                                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                            callback();
                                        }
                                        else {
                                            arg.invokeEvent('addChild', r, resource);
                                            writeLock(resource, function () {
                                                arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                                arg.writeXML(createResponse(arg, lock_1));
                                                callback();
                                            });
                                        }
                                    });
                                }); });
                            });
                        });
                    });
                });
                return;
            }
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                callback();
                return;
            }
            function writeLock(r, cb) {
                arg.requirePrivilege(['canSetLock'], r, function () {
                    r.setLock(lock_1, function (e) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.Locked);
                            callback();
                            return;
                        }
                        arg.invokeEvent('lock', r, lock_1);
                        arg.response.setHeader('Lock-Token', lock_1.uuid);
                        cb();
                    }); });
                });
            }
            arg.checkIfHeader(r, function () {
                writeLock(r, function () {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                    arg.writeXML(createResponse(arg, lock_1));
                    callback();
                });
            });
        });
    }
    catch (ex) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
        callback();
        return;
    }
}
function refreshLock(arg, lockUUID, callback) {
    arg.getResource(function (e, r) {
        if (e) {
            arg.setCode(e === Errors_1.Errors.ResourceNotFound ? WebDAVRequest_1.HTTPCodes.NotFound : WebDAVRequest_1.HTTPCodes.InternalServerError);
            callback();
            return;
        }
        arg.requirePrivilege(['canSetLock', 'canGetLock'], r, function () {
            r.getLock(lockUUID, function (e, lock) {
                if (e || !lock) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.PreconditionFailed);
                    callback();
                    return;
                }
                lock.refresh();
                arg.invokeEvent('refreshLock', r, lock);
                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                arg.writeXML(createResponse(arg, lock));
                callback();
            });
        });
    });
}
function default_1(arg, callback) {
    if (!arg.user) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
        callback();
        return;
    }
    if (arg.contentLength > 0) {
        createLock(arg, callback);
        return;
    }
    var ifHeader = arg.findHeader('If');
    if (!ifHeader) {
        arg.setCode(WebDAVRequest_1.HTTPCodes.PreconditionRequired);
        callback();
        return;
    }
    refreshLock(arg, IfParser_1.extractOneToken(ifHeader), callback);
}
exports.default = default_1;
