"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var Resource_1 = require("../../resource/Resource");
var xml = require("xmlbuilder");
function default_1(arg, callback) {
    arg.getResource(function (e, resource) {
        if (e || !resource) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        var multistatus = xml.create('D:multistatus', ['xmlns:D="DAV:"']);
        resource.type(function (e, type) {
            if (!type.isDirectory || arg.depth === 0) {
                addXMLInfo(resource, multistatus, function () { return done(multistatus); });
                return;
            }
            resource.getChildren(function (e, children) {
                var nb = children.length + 1;
                function nbOut() {
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
            propstat.ele('D:status', null, 'HTTP/1.1 200 OK');
            var prop = propstat.ele('D:prop');
            var nb = 7;
            function nbOut() {
                --nb;
                if (nb === 0)
                    callback();
            }
            resource.creationDate(function (e, ticks) {
                prop.ele('D:creationdate', null, arg.dateISO8601(ticks));
                nbOut();
            });
            arg.getResourcePath(resource, function (e, path) {
                response.ele('D:href', null, arg.fullUri(path).replace(' ', '%20'));
                nbOut();
            });
            resource.webName(function (e, name) {
                prop.ele('D:displayname', name);
                nbOut();
            });
            var supportedlock = prop.ele('D:supportedlock');
            resource.getAvailableLocks(function (e, lockKinds) {
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
                for (var name_1 in properties) {
                    var value = properties[name_1];
                    prop.ele(name_1, null, value);
                }
                nbOut();
            });
            resource.type(function (e, type) {
                var resourcetype = prop.ele('D:resourcetype');
                if (type.isDirectory)
                    resourcetype.ele('D:collection');
                if (type.isFile) {
                    nb += 2;
                    resource.mimeType(function (e, mimeType) {
                        prop.ele('D:getcontenttype', null, mimeType);
                        nbOut();
                    });
                    resource.size(function (e, size) {
                        prop.ele('D:getcontentlength', null, size);
                        nbOut();
                    });
                }
                nbOut();
            });
            resource.lastModifiedDate(function (e, lastModifiedDate) {
                prop.ele('D:getetag', null, '\"' + Resource_1.ETag.createETag(lastModifiedDate) + '\"');
                prop.ele('D:getlastmodified', new Date(lastModifiedDate).toUTCString());
                nbOut();
            });
        }
        function done(multistatus) {
            var content = '<?xml version="1.0" encoding="utf-8" ?>\r\n' + multistatus.toString({ pretty: false });
            arg.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
            arg.response.setHeader('Content-Type', 'text/xml; charset="utf-8"');
            arg.response.setHeader('Content-Length', content.length.toString());
            arg.response.write(content);
            callback();
        }
    });
}
exports.default = default_1;
