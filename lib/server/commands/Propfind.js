"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../resource/IResource");
var XML_1 = require("../../helper/XML");
var FSPath_1 = require("../../manager/FSPath");
var http = require("http");
function lockDiscovery(lockDiscoveryCache, arg, path, resource, callback) {
    var cached = lockDiscoveryCache[path.toString()];
    if (cached) {
        callback(null, cached);
        return;
    }
    var _Callback = callback;
    callback = function (e, l) {
        if (!e)
            lockDiscoveryCache[path.toString()] = l;
        _Callback(e, l);
    };
    arg.requireErPrivilege('canListLocks', resource, function (e, can) {
        if (e || !can) {
            callback(e, {});
            return;
        }
        resource.getLocks(function (e, locks) {
            if (resource.parent) {
                var parentPath = path.getParent();
                lockDiscovery(lockDiscoveryCache, arg, parentPath, resource.parent, function (e, l) {
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
function parseRequestBody(arg) {
    var xml = XML_1.XML.parse(arg.data);
    var allTrue = {
        leftElements: [],
        mustDisplay: function () { return true; },
        mustDisplayValue: function () { return true; }
    };
    var onlyName = {
        leftElements: [],
        mustDisplay: function () { return true; },
        mustDisplayValue: function () { return false; }
    };
    if (arg.contentLength <= 0)
        return allTrue;
    try {
        var propfind = xml.find('DAV:propfind');
        if (propfind.findIndex('DAV:propname') !== -1)
            return onlyName;
        if (propfind.findIndex('DAV:allprop') !== -1)
            return allTrue;
        var prop_1 = propfind.find('DAV:prop');
        var fn = function (name) {
            var index = prop_1.findIndex(name);
            if (index === -1)
                return false;
            delete prop_1.elements[index];
            return true;
        };
        return {
            leftElements: prop_1.elements,
            mustDisplay: fn,
            mustDisplayValue: function () { return true; }
        };
    }
    catch (ex) {
        return allTrue;
    }
}
function propstatStatus(status) {
    return 'HTTP/1.1 ' + status + ' ' + http.STATUS_CODES[status];
}
function default_1(arg, callback) {
    arg.getResource(function (e, resource) {
        if (e || !resource) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        var lockDiscoveryCache = {};
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
                var reqBody = parseRequestBody(arg);
                var response = multistatus.ele('D:response');
                var propstat = response.ele('D:propstat');
                var privileges = [
                    'canGetCreationDate', 'canGetAvailableLocks', 'canGetLastModifiedDate', 'canGetMimeType', 'canGetProperties', 'canGetSize', 'canGetType', 'canGetWebName'
                ];
                if (targetSource)
                    privileges.push('canSource');
                arg.requireErPrivilege(privileges, resource, function (e, can) {
                    if (e) {
                        propstat.ele('D:status').add(propstatStatus(WebDAVRequest_1.HTTPCodes.InternalServerError));
                        callback();
                        return;
                    }
                    if (!can) {
                        propstat.ele('D:status').add(propstatStatus(WebDAVRequest_1.HTTPCodes.Forbidden));
                        callback();
                        return;
                    }
                    propstat.ele('D:status').add('HTTP/1.1 200 OK');
                    var prop = propstat.ele('D:prop');
                    var nb = 1;
                    function nbOut(error) {
                        if (nb > 0 && error) {
                            nb = -1000;
                            callback(error);
                            return;
                        }
                        --nb;
                        if (nb === 0) {
                            if (reqBody.leftElements.length > 0) {
                                var propstatError = response.ele('D:propstat');
                                var prop_2 = propstatError.ele('D:prop');
                                propstatError.ele('D:status').add(propstatStatus(WebDAVRequest_1.HTTPCodes.NotFound));
                                for (var i = 0; i < reqBody.leftElements.length; ++i)
                                    if (reqBody.leftElements[i])
                                        prop_2.ele(reqBody.leftElements[i].name);
                            }
                            callback();
                        }
                    }
                    var tags = {};
                    function mustDisplayTag(name) {
                        if (reqBody.mustDisplay('DAV:' + name))
                            tags[name] = {
                                el: prop.ele('D:' + name),
                                value: reqBody.mustDisplayValue('DAV:' + name)
                            };
                        else
                            tags[name] = {
                                value: false
                            };
                    }
                    mustDisplayTag('getlastmodified');
                    mustDisplayTag('lockdiscovery');
                    mustDisplayTag('supportedlock');
                    mustDisplayTag('creationdate');
                    mustDisplayTag('resourcetype');
                    mustDisplayTag('displayname');
                    mustDisplayTag('getetag');
                    function displayValue(values, fn) {
                        if (values.constructor === String ? tags[values].value : values.some(function (n) { return tags[n].value; })) {
                            ++nb;
                            process.nextTick(fn);
                        }
                    }
                    displayValue('creationdate', function () {
                        resource.creationDate(function (e, ticks) { return process.nextTick(function () {
                            if (!e)
                                tags.creationdate.el.add(arg.dateISO8601(ticks));
                            nbOut(e);
                        }); });
                    });
                    ++nb;
                    arg.getResourcePath(resource, function (e, path) {
                        if (e) {
                            nbOut(e);
                            return;
                        }
                        if (tags.lockdiscovery.value) {
                            ++nb;
                            lockDiscovery(lockDiscoveryCache, arg, new FSPath_1.FSPath(path), resource, function (e, l) {
                                if (e) {
                                    nbOut(e);
                                    return;
                                }
                                for (var path_1 in l) {
                                    for (var _i = 0, _a = l[path_1]; _i < _a.length; _i++) {
                                        var _lock = _a[_i];
                                        var lock = _lock;
                                        var activelock = tags.lockdiscovery.el.ele('D:activelock');
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
                        resource.type(function (e, type) { return process.nextTick(function () {
                            if (e) {
                                nbOut(e);
                                return;
                            }
                            var p = arg.fullUri(path).replace(' ', '%20');
                            response.ele('D:href').add(p.lastIndexOf('/') !== p.length - 1 && type.isDirectory ? p + '/' : p);
                            response.ele('D:location').ele('D:href').add(p);
                            if (tags.resourcetype.value && type.isDirectory)
                                tags.resourcetype.el.ele('D:collection');
                            if (type.isFile) {
                                mustDisplayTag('getcontentlength');
                                mustDisplayTag('getcontenttype');
                                if (tags.getcontenttype.value) {
                                    ++nb;
                                    resource.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                                        if (!e)
                                            tags.getcontenttype.el.add(mimeType);
                                        nbOut(e);
                                    }); });
                                }
                                if (tags.getcontentlength.value) {
                                    ++nb;
                                    resource.size(targetSource, function (e, size) { return process.nextTick(function () {
                                        if (!e)
                                            tags.getcontentlength.el.add(size === undefined || size === null || size.constructor !== Number ? 0 : size);
                                        nbOut(e);
                                    }); });
                                }
                            }
                            nbOut();
                        }); });
                    });
                    displayValue('displayname', function () {
                        resource.webName(function (e, name) { return process.nextTick(function () {
                            if (!e)
                                tags.displayname.el.add(name ? name : '');
                            nbOut(e);
                        }); });
                    });
                    displayValue('supportedlock', function () {
                        resource.getAvailableLocks(function (e, lockKinds) { return process.nextTick(function () {
                            if (e) {
                                nbOut(e);
                                return;
                            }
                            lockKinds.forEach(function (lockKind) {
                                var lockentry = tags.supportedlock.el.ele('D:lockentry');
                                var lockscope = lockentry.ele('D:lockscope');
                                lockscope.ele('D:' + lockKind.scope.value.toLowerCase());
                                var locktype = lockentry.ele('D:locktype');
                                locktype.ele('D:' + lockKind.type.value.toLowerCase());
                            });
                            nbOut();
                        }); });
                    });
                    displayValue(['getetag', 'getlastmodified'], function () {
                        resource.lastModifiedDate(function (e, lastModifiedDate) { return process.nextTick(function () {
                            if (!e) {
                                if (tags.getetag.value)
                                    tags.getetag.el.add(IResource_1.ETag.createETag(lastModifiedDate));
                                if (tags.getlastmodified.value)
                                    tags.getlastmodified.el.add(new Date(lastModifiedDate).toUTCString());
                            }
                            nbOut(e);
                        }); });
                    });
                    ++nb;
                    process.nextTick(function () {
                        resource.getProperties(function (e, properties) { return process.nextTick(function () {
                            if (e) {
                                nbOut(e);
                                return;
                            }
                            for (var name_1 in properties) {
                                if (reqBody.mustDisplay(name_1)) {
                                    var tag = prop.ele(name_1);
                                    if (reqBody.mustDisplayValue(name_1))
                                        tag.add(properties[name_1]);
                                }
                            }
                            nbOut();
                        }); });
                    });
                    nbOut();
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
