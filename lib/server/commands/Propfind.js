"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../resource/IResource");
var FSPath_1 = require("../../manager/FSPath");
var XML_1 = require("../../helper/XML");
var http = require("http");
function lockDiscovery(arg, path, resource, callback) {
    arg.requireErPrivilege('canListLocks', resource, function (e, can) {
        if (e || !can) {
            callback(e, {});
            return;
        }
        resource.getLocks(function (e, locks) {
            if (resource.parent) {
                var parentPath = path.getParent();
                lockDiscovery(arg, parentPath, resource.parent, function (e, l) {
                    if (e)
                        callback(e, null);
                    else {
                        l[path.toString()] = locks;
                        callback(null, l);
                    }
                });
            }
            else
                callback(null, (_a = {},
                    _a[path.toString()] = locks,
                    _a));
            var _a;
        });
    });
}
function default_1(arg, callback) {
    arg.getResource(function (e, resource) {
        if (e || !resource) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        arg.checkIfHeader(resource, function () {
            var targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';
            var multistatus = XML_1.XML.createElement('D:multistatus', {
                'xmlns:D': 'DAV:'
            });
            resource.type(function (e, type) { return process.nextTick(function () {
                if (!type.isDirectory || arg.depth === 0) {
                    addXMLInfo(resource, multistatus, function () { return done(multistatus); });
                    return;
                }
                arg.requirePrivilege('canGetChildren', resource, function () {
                    resource.getChildren(function (e, children) { return process.nextTick(function () {
                        var nb = children.length + 1;
                        function nbOut(error) {
                            if (nb > 0 && error) {
                                nb = -1;
                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            --nb;
                            if (nb === 0)
                                done(multistatus);
                        }
                        addXMLInfo(resource, multistatus, nbOut);
                        children.forEach(function (child) { return process.nextTick(function () {
                            addXMLInfo(child, multistatus, nbOut);
                        }); });
                    }); });
                });
            }); });
            function addXMLInfo(resource, multistatus, callback) {
                var response = multistatus.ele('D:response');
                var propstat = response.ele('D:propstat');
                var privileges = [
                    'canGetCreationDate', 'canGetAvailableLocks', 'canGetLastModifiedDate', 'canGetMimeType', 'canGetProperties', 'canGetSize', 'canGetType', 'canGetWebName'
                ];
                if (targetSource)
                    privileges.push('canSource');
                arg.requireErPrivilege(privileges, resource, function (e, can) {
                    if (e) {
                        propstat.ele('D:status').add('HTTP/1.1 ' + WebDAVRequest_1.HTTPCodes.InternalServerError + ' ' + http.STATUS_CODES[WebDAVRequest_1.HTTPCodes.InternalServerError]);
                        callback();
                        return;
                    }
                    if (!can) {
                        propstat.ele('D:status').add('HTTP/1.1 ' + WebDAVRequest_1.HTTPCodes.Forbidden + ' ' + http.STATUS_CODES[WebDAVRequest_1.HTTPCodes.Forbidden]);
                        callback();
                        return;
                    }
                    propstat.ele('D:status').add('HTTP/1.1 200 OK');
                    var prop = propstat.ele('D:prop');
                    var nb = 7;
                    function nbOut(error) {
                        if (nb > 0 && error) {
                            nb = -1;
                            callback(error);
                            return;
                        }
                        --nb;
                        if (nb === 0)
                            callback();
                    }
                    resource.creationDate(function (e, ticks) { return process.nextTick(function () {
                        if (!e)
                            prop.ele('D:creationdate').add(arg.dateISO8601(ticks));
                        nbOut(e);
                    }); });
                    arg.getResourcePath(resource, function (e, path) {
                        if (!e) {
                            response.ele('D:href').add(arg.fullUri(path).replace(' ', '%20'));
                            var lockdiscovery_1 = prop.ele('D:lockdiscovery');
                            lockDiscovery(arg, new FSPath_1.FSPath(path), resource, function (e, l) {
                                if (e) {
                                    nbOut(e);
                                    return;
                                }
                                for (var path_1 in l) {
                                    for (var _i = 0, _a = l[path_1]; _i < _a.length; _i++) {
                                        var _lock = _a[_i];
                                        var lock = _lock;
                                        var activelock = lockdiscovery_1.ele('D:activelock');
                                        activelock.ele('D:lockscope').ele('D:' + lock.lockKind.scope.value.toLowerCase());
                                        activelock.ele('D:locktype').ele('D:' + lock.lockKind.type.value.toLowerCase());
                                        activelock.ele('D:depth').add('Infinity');
                                        if (lock.owner)
                                            activelock.ele('D:owner').add(lock.owner);
                                        activelock.ele('D:timeout').add('Second-' + (lock.expirationDate - Date.now()));
                                        activelock.ele('D:locktoken').ele('D:href').add(lock.uuid);
                                        activelock.ele('D:lockroot').ele('D:href').add(arg.fullUri(path_1).replace(' ', '%20'));
                                    }
                                }
                                nbOut(null);
                            });
                        }
                        else
                            nbOut(e);
                    });
                    resource.webName(function (e, name) { return process.nextTick(function () {
                        if (!e)
                            prop.ele('D:displayname').add(name ? name : '');
                        nbOut(e);
                    }); });
                    var supportedlock = prop.ele('D:supportedlock');
                    resource.getAvailableLocks(function (e, lockKinds) { return process.nextTick(function () {
                        if (e) {
                            nbOut(e);
                            return;
                        }
                        lockKinds.forEach(function (lockKind) {
                            var lockentry = supportedlock.ele('D:lockentry');
                            var lockscope = lockentry.ele('D:lockscope');
                            lockscope.ele('D:' + lockKind.scope.value.toLowerCase());
                            var locktype = lockentry.ele('D:locktype');
                            locktype.ele('D:' + lockKind.type.value.toLowerCase());
                        });
                        nbOut();
                    }); });
                    resource.getProperties(function (e, properties) { return process.nextTick(function () {
                        if (e) {
                            nbOut(e);
                            return;
                        }
                        for (var name_1 in properties) {
                            var value = properties[name_1];
                            prop.ele(name_1).add(value);
                        }
                        nbOut();
                    }); });
                    resource.type(function (e, type) { return process.nextTick(function () {
                        if (e) {
                            nbOut(e);
                            return;
                        }
                        var resourcetype = prop.ele('D:resourcetype');
                        if (type.isDirectory)
                            resourcetype.ele('D:collection');
                        if (type.isFile) {
                            nb += 2;
                            resource.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                                if (!e)
                                    prop.ele('D:getcontenttype').add(mimeType);
                                nbOut(e);
                            }); });
                            resource.size(targetSource, function (e, size) { return process.nextTick(function () {
                                if (!e)
                                    prop.ele('D:getcontentlength').add(size);
                                nbOut(e);
                            }); });
                        }
                        nbOut();
                    }); });
                    resource.lastModifiedDate(function (e, lastModifiedDate) { return process.nextTick(function () {
                        if (!e) {
                            prop.ele('D:getetag').add(IResource_1.ETag.createETag(lastModifiedDate));
                            prop.ele('D:getlastmodified').add(new Date(lastModifiedDate).toUTCString());
                        }
                        nbOut(e);
                    }); });
                });
            }
            function done(multistatus) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                arg.writeXML(multistatus);
                callback();
            }
        });
    });
}
exports.default = default_1;
