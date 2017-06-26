"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var http_1 = require("http");
var Workflow_1 = require("../../../helper/Workflow");
var XML_1 = require("../../../helper/XML");
var Errors_1 = require("../../../Errors");
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.getResource(function (e, r) {
            ctx.checkIfHeader(r, function () {
                //ctx.requirePrivilege([ 'canSetProperty', 'canRemoveProperty' ], r, () => {
                var multistatus = XML_1.XML.createElement('D:multistatus', {
                    'xmlns:D': 'DAV:'
                });
                var response = multistatus.ele('D:response');
                response.ele('D:href', undefined, true).add(ctx.fullUri());
                try {
                    var xml = XML_1.XML.parse(data);
                    var root_1 = xml.find('DAV:propertyupdate');
                    var finalize_1 = function () {
                        finalize_1 = function () {
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.MultiStatus);
                            ctx.writeBody(multistatus);
                            callback();
                        };
                    };
                    var notify_1 = function (el, error) {
                        var code = error ? WebDAVRequest_1.HTTPCodes.Conflict : WebDAVRequest_1.HTTPCodes.OK;
                        var propstat = response.ele('D:propstat');
                        propstat.ele('D:prop').ele(el.name);
                        propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + http_1.STATUS_CODES[code]);
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
                                .each(els, fnProp)
                                .intermediate(function (el, e) {
                                /*if(!e)
                                    ctx.invokeEvent(eventName, r, el)*/
                                notify_1(el, e);
                            })
                                .done(function () { return finalize_1(); });
                        });
                    };
                    r.propertyManager(function (e, pm) {
                        if (e) {
                            ctx.setCode(e === Errors_1.Errors.ResourceNotFound ? WebDAVRequest_1.HTTPCodes.NotFound : WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return callback();
                        }
                        execute_1('DAV:set', 'setProperty', function (el, callback) {
                            pm.setProperty(el.name, el.elements, callback);
                        });
                        execute_1('DAV:remove', 'removeProperty', function (el, callback) {
                            pm.removeProperty(el.name, callback);
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
    default_1.prototype.isValidFor = function (type) {
        return !!type;
    };
    return default_1;
}());
exports.default = default_1;
