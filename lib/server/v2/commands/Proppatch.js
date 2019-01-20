"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var xml_js_builder_1 = require("xml-js-builder");
var http_1 = require("http");
var JSCompatibility_1 = require("../../../helper/JSCompatibility");
var Workflow_1 = require("../../../helper/Workflow");
var Errors_1 = require("../../../Errors");
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.getResource(function (e, r) {
            ctx.checkIfHeader(r, function () {
                //ctx.requirePrivilege([ 'canSetProperty', 'canRemoveProperty' ], r, () => {
                var multistatus = new xml_js_builder_1.XMLElementBuilder('D:multistatus', {
                    'xmlns:D': 'DAV:'
                });
                var response = multistatus.ele('D:response');
                response.ele('D:href', undefined, true).add(WebDAVRequest_1.HTTPRequestContext.encodeURL(ctx.fullUri()));
                try {
                    var xml = xml_js_builder_1.XML.parse(data);
                    var root_1 = xml.find('DAV:propertyupdate');
                    var notifications_1 = {};
                    var reverse_1 = [];
                    var finalize_1 = function () {
                        finalize_1 = function () {
                            var next = function () {
                                var codes = Object.keys(notifications_1);
                                codes.forEach(function (code) {
                                    var propstat = response.ele('D:propstat');
                                    var prop = propstat.ele('D:prop');
                                    notifications_1[code].forEach(function (name) { return prop.add(new xml_js_builder_1.XMLElementBuilder(name)); });
                                    propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + http_1.STATUS_CODES[code]);
                                });
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                                ctx.writeBody(multistatus);
                                callback();
                            };
                            if (Object.keys(notifications_1).length > 1) {
                                new Workflow_1.Workflow()
                                    .each(reverse_1, function (action, cb) { return action(cb); })
                                    .error(function (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    callback();
                                })
                                    .done(function () {
                                    if (notifications_1[WebDAVRequest_1.HTTPCodes.OK]) {
                                        notifications_1[WebDAVRequest_1.HTTPCodes.FailedDependency] = notifications_1[WebDAVRequest_1.HTTPCodes.OK];
                                        delete notifications_1[WebDAVRequest_1.HTTPCodes.OK];
                                    }
                                    next();
                                });
                            }
                            else
                                next();
                        };
                    };
                    var notify_1 = function (el, error) {
                        var code = error ? WebDAVRequest_1.HTTPCodes.Forbidden : WebDAVRequest_1.HTTPCodes.OK;
                        if (!notifications_1[code])
                            notifications_1[code] = [];
                        notifications_1[code].push(el.name);
                    };
                    var execute_1 = function (name, eventName, fnProp) {
                        var list = root_1.findMany(name);
                        if (list.length === 0) {
                            finalize_1();
                            return;
                        }
                        list.forEach(function (el) {
                            var els = el.find('DAV:prop').elements;
                            new Workflow_1.Workflow(false)
                                .each(els, function (x, cb) {
                                if (x.type !== 'element')
                                    return cb();
                                fnProp(x, cb);
                            })
                                .intermediate(function (el, e) {
                                /*if(!e)
                                    ctx.invokeEvent(eventName, r, el)*/
                                if (el.type === 'element')
                                    notify_1(el, e);
                            })
                                .done(function (_) { return finalize_1(); });
                        });
                    };
                    r.fs.checkPrivilege(ctx, r.path, 'canWriteProperties', function (e, can) {
                        if (e || !can) {
                            if (e) {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            }
                            else if (!can)
                                ctx.setCodeFromError(Errors_1.Errors.NotEnoughPrivilege);
                            return callback();
                        }
                        r.fs.isLocked(ctx, r.path, function (e, locked) {
                            if (e || locked) {
                                if (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                }
                                else if (locked)
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.Locked);
                                return callback();
                            }
                            r.propertyManager(function (e, pm) {
                                if (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    return callback();
                                }
                                pm.getProperties(function (e, props) {
                                    if (e) {
                                        if (!ctx.setCodeFromError(e))
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                        return callback();
                                    }
                                    var properties = JSON.parse(JSON.stringify(props));
                                    var pushSetReverseAction = function (el) {
                                        var prop = properties[el.name];
                                        if (prop)
                                            reverse_1.push(function (cb) { return pm.setProperty(el.name, prop.value, prop.attributes, cb); });
                                        else
                                            reverse_1.push(function (cb) { return pm.removeProperty(el.name, cb); });
                                    };
                                    var pushRemoveReverseAction = function (el) {
                                        var prop = properties[el.name];
                                        reverse_1.push(function (cb) { return pm.setProperty(el.name, prop.value, prop.attributes, cb); });
                                    };
                                    execute_1('DAV:set', 'setProperty', function (el, callback) {
                                        if (JSCompatibility_1.startsWith(el.name, 'DAV:')) {
                                            pushSetReverseAction(el);
                                            return callback(Errors_1.Errors.Forbidden);
                                        }
                                        pm.setProperty(el.name, el.elements, el.attributes, function (e) {
                                            if (!e)
                                                pushSetReverseAction(el);
                                            callback(e);
                                        });
                                    });
                                    execute_1('DAV:remove', 'removeProperty', function (el, callback) {
                                        if (JSCompatibility_1.startsWith(el.name, 'DAV:')) {
                                            pushRemoveReverseAction(el);
                                            return callback(Errors_1.Errors.Forbidden);
                                        }
                                        pm.removeProperty(el.name, function (e) {
                                            if (!e)
                                                pushRemoveReverseAction(el);
                                            callback(e);
                                        });
                                    });
                                }, false);
                            });
                        });
                    });
                }
                catch (ex) {
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                    callback();
                }
                //})
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
