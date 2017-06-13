"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var http_1 = require("http");
var XML_1 = require("../../helper/XML");
function default_1(arg, callback) {
    arg.getResource(function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        arg.checkIfHeader(r, function () {
            arg.requirePrivilege(['canSetProperty', 'canRemoveProperty'], r, function () {
                var multistatus = XML_1.XML.createElement('D:multistatus', {
                    'xmlns:D': 'DAV:'
                });
                var response = multistatus.ele('D:response');
                response.ele('D:href', undefined, true).add(arg.fullUri());
                try {
                    var xml = XML_1.XML.parse(arg.data);
                    var root_1 = xml.find('DAV:propertyupdate');
                    var finalize_1 = function () {
                        finalize_1 = function () {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                            arg.writeXML(multistatus);
                            callback();
                        };
                    };
                    var notify_1 = function (el, error) {
                        var code = error ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.OK;
                        var propstat = response.ele('D:propstat');
                        propstat.ele('D:prop').ele(el.name);
                        propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + http_1.STATUS_CODES[code]);
                    };
                    var execute = function (name, eventName, fnProp) {
                        var list = root_1.findMany(name);
                        if (list.length === 0) {
                            finalize_1();
                            return;
                        }
                        list.forEach(function (el) {
                            var els = el.find('DAV:prop').elements;
                            if (els.length === 0) {
                                finalize_1();
                                return;
                            }
                            var nb = els.length;
                            els.forEach(function (el) {
                                fnProp(el, function (e) { return process.nextTick(function () {
                                    if (!e)
                                        arg.invokeEvent(eventName, r, el);
                                    notify_1(el, e);
                                    --nb;
                                    if (nb === 0)
                                        finalize_1();
                                }); });
                            });
                        });
                    };
                    execute('DAV:set', 'setProperty', function (el, callback) {
                        r.setProperty(el.name, el.elements, callback);
                    });
                    execute('DAV:remove', 'removeProperty', function (el, callback) {
                        r.removeProperty(el.name, callback);
                    });
                }
                catch (ex) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                    callback();
                }
            });
        });
    });
}
exports.default = default_1;
