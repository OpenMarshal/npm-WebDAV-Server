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
        arg.requirePrivilege(['canSetProperty', 'canRemoveProperty'], r, function () {
            var multistatus = XML_1.XML.createElement('D:multistatus', {
                'xmlns:D': 'DAV:'
            });
            var response = multistatus.ele('D:response');
            response.ele('D:href').add(arg.fullUri());
            var xml = XML_1.XML.parse(arg.data);
            var root = xml.find('DAV:propertyupdate');
            var finalize = function () {
                finalize = function () {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                    arg.writeXML(multistatus);
                    callback();
                };
            };
            function notify(el, error) {
                var code = error ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.OK;
                var propstat = response.ele('D:propstat');
                propstat.ele('D:prop').ele(el.name);
                propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + http_1.STATUS_CODES[code]);
            }
            execute('DAV:set', function (el, callback) {
                r.setProperty(el.name, el.elements, callback);
            });
            execute('DAV:remove', function (el, callback) {
                r.removeProperty(el.name, callback);
            });
            function execute(name, fnProp) {
                var list = root.findMany(name);
                if (list.length === 0) {
                    finalize();
                    return;
                }
                list.forEach(function (el) {
                    var els = el.find('DAV:prop').elements;
                    if (els.length === 0) {
                        finalize();
                        return;
                    }
                    var nb = els.length;
                    els.forEach(function (el) {
                        fnProp(el, function (e) {
                            notify(el, e);
                            --nb;
                            if (nb === 0)
                                finalize();
                        });
                    });
                });
            }
        });
    });
}
exports.default = default_1;
