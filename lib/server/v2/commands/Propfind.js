"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var xml_js_builder_1 = require("xml-js-builder");
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var http = require("http");
function dateISO8601(ticks) {
    // Adding date
    var date = new Date(ticks);
    var result = date.toISOString().substring(0, '0000-00-00T00:00:00'.length);
    // Adding timezone offset
    var offset = date.getTimezoneOffset();
    result += offset < 0 ? '-' : '+';
    offset = Math.abs(offset);
    var h = Math.floor(offset / 60).toString(10);
    while (h.length < 2)
        h = '0' + h;
    var m = (offset % 60).toString(10);
    while (m.length < 2)
        m = '0' + m;
    result += h + ':' + m;
    return result;
}
function parseRequestBody(ctx, data) {
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
    if (ctx.headers.contentLength <= 0)
        return allTrue;
    try {
        var xml = xml_js_builder_1.XML.parse(data);
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
            prop_1.elements.splice(index, 1);
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
    return "HTTP/1.1 " + status + " " + http.STATUS_CODES[status];
}
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.addXMLInfo = function (ctx, data, resource, multistatus, _callback) {
        var reqBody = parseRequestBody(ctx, data);
        var response = new xml_js_builder_1.XMLElementBuilder('D:response');
        var callback = function (e) {
            if (e === Errors_1.Errors.MustIgnore || e === Errors_1.Errors.ResourceNotFound)
                e = null;
            else if (!e)
                multistatus.add(response);
            else {
                var errorNumber = WebDAVRequest_1.HTTPRequestContext.defaultStatusCode(e);
                if (errorNumber !== null) {
                    var response_1 = new xml_js_builder_1.XMLElementBuilder('D:response');
                    response_1.ele('D:propstat').ele('D:status').add("HTTP/1.1 " + errorNumber + " " + http.STATUS_CODES[errorNumber]);
                    resource.fs.getFullPath(ctx, resource.path, function (e, path) {
                        if (e)
                            return nbOut(e);
                        var p = WebDAVRequest_1.HTTPRequestContext.encodeURL(ctx.fullUri(path.toString()));
                        response_1.ele('D:href', undefined, true).add(p);
                        if (ctx.server.options.enableLocationTag)
                            response_1.ele('D:location').ele('D:href', undefined, true).add(p);
                    });
                    multistatus.add(response_1);
                }
            }
            _callback(e);
        };
        var propstat = response.ele('D:propstat');
        propstat.ele('D:status').add('HTTP/1.1 200 OK');
        var prop = propstat.ele('D:prop');
        var nb = 1;
        function nbOut(error) {
            if (nb > 0 && error) {
                nb = -1000;
                return callback(error);
            }
            --nb;
            if (nb === 0) {
                if (reqBody.leftElements.length > 0) {
                    var propstatError = response.ele('D:propstat');
                    var prop_2 = propstatError.ele('D:prop');
                    propstatError.ele('D:status').add(propstatStatus(WebDAVRequest_1.HTTPCodes.NotFound));
                    for (var _i = 0, _a = reqBody.leftElements; _i < _a.length; _i++) {
                        var el = _a[_i];
                        if (el) {
                            prop_2.add(el);
                        }
                    }
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
                    tags.creationdate.el.add(dateISO8601(ticks));
                nbOut(e);
            }); });
        });
        displayValue('lockdiscovery', function () {
            resource.listDeepLocks(function (e, locks) {
                if (e)
                    return nbOut(e);
                for (var path in locks) {
                    for (var _i = 0, _a = locks[path]; _i < _a.length; _i++) {
                        var _lock = _a[_i];
                        var lock = _lock;
                        var activelock = tags.lockdiscovery.el.ele('D:activelock');
                        activelock.ele('D:lockscope').ele('D:' + lock.lockKind.scope.value.toLowerCase());
                        activelock.ele('D:locktype').ele('D:' + lock.lockKind.type.value.toLowerCase());
                        activelock.ele('D:depth').add('Infinity');
                        if (lock.owner)
                            activelock.ele('D:owner').add(lock.owner);
                        activelock.ele('D:timeout').add("Second-" + (lock.expirationDate - Date.now()));
                        activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid);
                        activelock.ele('D:lockroot').ele('D:href', undefined, true).add(WebDAVRequest_1.HTTPRequestContext.encodeURL(ctx.fullUri(path)));
                    }
                }
                nbOut(null);
            });
        });
        ++nb;
        resource.type(function (e, type) { return process.nextTick(function () {
            if (e)
                return nbOut(e);
            resource.fs.getFullPath(ctx, resource.path, function (e, path) {
                if (e)
                    return nbOut(e);
                var p = WebDAVRequest_1.HTTPRequestContext.encodeURL(ctx.fullUri(path.toString()));
                var href = p.lastIndexOf('/') !== p.length - 1 && type.isDirectory ? p + '/' : p;
                response.ele('D:href', undefined, true).add(href);
                if (ctx.server.options.enableLocationTag)
                    response.ele('D:location').ele('D:href', undefined, true).add(p);
                if (tags.resourcetype.value && type.isDirectory)
                    tags.resourcetype.el.ele('D:collection');
                if (type.isFile) {
                    mustDisplayTag('getcontentlength');
                    mustDisplayTag('getcontenttype');
                    if (tags.getcontenttype.value) {
                        ++nb;
                        resource.mimeType(ctx.headers.isSource, function (e, mimeType) { return process.nextTick(function () {
                            if (!e)
                                tags.getcontenttype.el.add(mimeType);
                            nbOut(e);
                        }); });
                    }
                    if (tags.getcontentlength.value) {
                        ++nb;
                        resource.size(ctx.headers.isSource, function (e, size) { return process.nextTick(function () {
                            if (!e)
                                tags.getcontentlength.el.add(size === undefined || size === null || size.constructor !== Number ? 0 : size);
                            nbOut(e);
                        }); });
                    }
                }
                nbOut();
            });
        }); });
        displayValue('displayname', function () {
            var methodDisplayName = resource.webName;
            if (resource.displayName)
                methodDisplayName = resource.displayName;
            methodDisplayName.bind(resource)(function (e, name) { return process.nextTick(function () {
                if (!e)
                    tags.displayname.el.add(name || '');
                nbOut(e);
            }); });
        });
        displayValue('supportedlock', function () {
            resource.availableLocks(function (e, lockKinds) { return process.nextTick(function () {
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
        displayValue('getlastmodified', function () {
            resource.lastModifiedDate(function (e, lastModifiedDate) { return process.nextTick(function () {
                if (!e && tags.getlastmodified.value)
                    tags.getlastmodified.el.add(new Date(lastModifiedDate).toUTCString());
                nbOut(e);
            }); });
        });
        displayValue('getetag', function () {
            resource.etag(function (e, etag) { return process.nextTick(function () {
                if (!e && tags.getetag.value)
                    tags.getetag.el.add(etag);
                nbOut(e);
            }); });
        });
        ++nb;
        process.nextTick(function () {
            resource.propertyManager(function (e, pm) {
                if (e)
                    return nbOut(e);
                pm.getProperties(function (e, properties) {
                    if (e)
                        return nbOut(e);
                    for (var name_1 in properties) {
                        if (reqBody.mustDisplay(name_1)) {
                            var tag = prop.ele(name_1);
                            if (reqBody.mustDisplayValue(name_1)) {
                                var property = properties[name_1];
                                if (tag.attributes)
                                    for (var attName in property.attributes)
                                        tag.attributes[attName] = property.attributes[attName];
                                else
                                    tag.attributes = property.attributes;
                                tag.add(property.value);
                            }
                        }
                    }
                    nbOut();
                });
            });
        });
        nbOut();
    };
    default_1.prototype.unchunked = function (ctx, data, callback) {
        var _this = this;
        if (ctx.server.options.maxRequestDepth < ctx.headers.depth || ctx.headers.depth < 0 && (ctx.server.options.maxRequestDepth !== Infinity && ctx.server.options.maxRequestDepth >= 0)) {
            ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
            callback();
            return;
        }
        ctx.getResource(function (e, resource) {
            ctx.checkIfHeader(resource, function () {
                var multistatus = new xml_js_builder_1.XMLElementBuilder('D:multistatus', {
                    'xmlns:D': 'DAV:'
                });
                var done = function (multistatus) {
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                    ctx.writeBody(multistatus);
                    callback();
                };
                resource.type(function (e, type) { return process.nextTick(function () {
                    if (e) {
                        if (!ctx.setCodeFromError(e))
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        return callback();
                    }
                    if (!type.isDirectory || ctx.headers.depth === 0) {
                        _this.addXMLInfo(ctx, data, resource, multistatus, function (e) {
                            if (!e)
                                done(multistatus);
                            else {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                            }
                        });
                        return;
                    }
                    var injectResourcePropfind = function (resource, depth, callback) {
                        --depth;
                        resource.readDir(true, function (e, children) { return process.nextTick(function () {
                            function err(e) {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                callback();
                            }
                            if (e)
                                return err(e);
                            resource.fs.getFullPath(ctx, resource.path, function (e, rsPath) {
                                new Workflow_1.Workflow()
                                    .each(children, function (childName, cb) {
                                    ctx.server.getResource(ctx, rsPath.getChildPath(childName), function (e, r) {
                                        if (e)
                                            return cb(e);
                                        _this.addXMLInfo(ctx, data, r, multistatus, function (e) {
                                            if (e)
                                                return cb(e);
                                            if (depth !== 0) {
                                                r.type(function (e, type) {
                                                    if (e || !type.isDirectory)
                                                        return cb(e);
                                                    injectResourcePropfind(r, depth, function () {
                                                        cb();
                                                    });
                                                });
                                            }
                                            else {
                                                cb();
                                            }
                                        });
                                    });
                                })
                                    .error(err)
                                    .done(function () {
                                    callback();
                                });
                            });
                        }); });
                    };
                    _this.addXMLInfo(ctx, data, resource, multistatus, function (e) {
                        if (!e) {
                            injectResourcePropfind(resource, ctx.headers.depth, function () {
                                done(multistatus);
                            });
                        }
                        else {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            callback();
                        }
                    });
                }); });
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
