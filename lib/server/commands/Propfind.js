"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var IResource_1 = require("../../resource/IResource");
var XML_1 = require("../../helper/XML");
var http = require("http");
function default_1(arg, callback) {
    arg.getResource(function (e, resource) {
        if (e || !resource) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        var multistatus = XML_1.XML.createElement('D:multistatus', {
            'xmlns:D': 'DAV:'
        });
        resource.type(function (e, type) {
            if (!type.isDirectory || arg.depth === 0) {
                addXMLInfo(resource, multistatus, function () { return done(multistatus); });
                return;
            }
            resource.getChildren(function (e, children) {
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
                children.forEach(function (child) {
                    addXMLInfo(child, multistatus, nbOut);
                });
            });
        });
        function addXMLInfo(resource, multistatus, callback) {
            var response = multistatus.ele('D:response');
            var propstat = response.ele('D:propstat');
            arg.requireErPrivilege(['canMove'], resource, function (e, can) {
                if (e) {
                    propstat.ele('D:status').add('HTTP/1.1 ' + WebDAVRequest_1.HTTPCodes.InternalServerError + ' ' + http.STATUS_CODES[WebDAVRequest_1.HTTPCodes.InternalServerError]);
                    callback();
                    return;
                }
                if (!can) {
                    propstat.ele('D:status').add('HTTP/1.1 ' + WebDAVRequest_1.HTTPCodes.Unauthorized + ' ' + http.STATUS_CODES[WebDAVRequest_1.HTTPCodes.Unauthorized]);
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
                resource.creationDate(function (e, ticks) {
                    if (!e)
                        prop.ele('D:creationdate').add(arg.dateISO8601(ticks));
                    nbOut(e);
                });
                arg.getResourcePath(resource, function (e, path) {
                    if (!e)
                        response.ele('D:href').add(arg.fullUri(path).replace(' ', '%20'));
                    nbOut(e);
                });
                resource.webName(function (e, name) {
                    if (!e)
                        prop.ele('D:displayname').add(name ? name : '');
                    nbOut(e);
                });
                var supportedlock = prop.ele('D:supportedlock');
                resource.getAvailableLocks(function (e, lockKinds) {
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
                });
                resource.getProperties(function (e, properties) {
                    if (e) {
                        nbOut(e);
                        return;
                    }
                    for (var name_1 in properties) {
                        var value = properties[name_1];
                        prop.ele(name_1).add(value);
                    }
                    nbOut();
                });
                resource.type(function (e, type) {
                    if (e) {
                        nbOut(e);
                        return;
                    }
                    var resourcetype = prop.ele('D:resourcetype');
                    if (type.isDirectory)
                        resourcetype.ele('D:collection');
                    if (type.isFile) {
                        nb += 2;
                        resource.mimeType(function (e, mimeType) {
                            if (!e)
                                prop.ele('D:getcontenttype').add(mimeType);
                            nbOut(e);
                        });
                        resource.size(function (e, size) {
                            if (!e)
                                prop.ele('D:getcontentlength').add(size);
                            nbOut(e);
                        });
                    }
                    nbOut();
                });
                resource.lastModifiedDate(function (e, lastModifiedDate) {
                    if (!e) {
                        prop.ele('D:getetag').add(IResource_1.ETag.createETag(lastModifiedDate));
                        prop.ele('D:getlastmodified').add(new Date(lastModifiedDate).toUTCString());
                    }
                    nbOut(e);
                });
            });
        }
        function done(multistatus) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
            arg.writeXML(multistatus);
            callback();
        }
    });
}
exports.default = default_1;
