"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XML_1 = require("../helper/XML");
var FSManager_1 = require("../manager/FSManager");
var http = require("http");
var url = require("url");
var MethodCallArgs = (function () {
    function MethodCallArgs(server, request, response, callback) {
        this.server = server;
        this.request = request;
        this.response = response;
        this.callback = callback;
        this.contentLength = parseInt(this.findHeader('Content-length', '0'), 10);
        this.depth = parseInt(this.findHeader('Depth', '0'), 10);
        this.host = this.findHeader('Host');
        this.uri = url.parse(request.url).pathname;
        this.path = new FSManager_1.FSPath(this.uri);
    }
    MethodCallArgs.prototype.accept = function (regex) {
        var accepts = this.findHeader('Accept', 'text/xml').split(',');
        for (var _i = 0, accepts_1 = accepts; _i < accepts_1.length; _i++) {
            var value = accepts_1[_i];
            for (var i = 0; i < regex.length; ++i)
                if (regex[i].test(value))
                    return i;
        }
        return -1;
    };
    MethodCallArgs.prototype.findHeader = function (name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        name = name.replace(/(-| )/g, '').toLowerCase();
        for (var k in this.request.headers)
            if (k.replace(/(-| )/g, '').toLowerCase() === name)
                return this.request.headers[k];
        return defaultValue;
    };
    MethodCallArgs.prototype.getResource = function (callback) {
        this.server.getResourceFromPath(this.uri, callback);
    };
    MethodCallArgs.prototype.dateISO8601 = function (ticks) {
        var date = new Date(ticks);
        var result = date.toISOString().substring(0, '0000-00-00T00:00:00'.length);
        var offset = date.getTimezoneOffset();
        result += offset < 0 ? '-' : '+';
        offset = Math.abs(offset);
        var h = Math.ceil(offset / 60).toString(10);
        while (h.length < 2)
            h = '0' + h;
        var m = (offset % 60).toString(10);
        while (m.length < 2)
            m = '0' + m;
        result += h + ':' + m;
        return result;
    };
    MethodCallArgs.prototype.fullUri = function (uri) {
        if (uri === void 0) { uri = null; }
        if (!uri)
            uri = this.uri;
        return this.prefixUri() + uri.replace(/\/\//g, '/');
    };
    MethodCallArgs.prototype.prefixUri = function () {
        return 'http://' + this.host.replace('/', '');
    };
    MethodCallArgs.prototype.getResourcePath = function (resource, callback) {
        var _this = this;
        if (!resource.parent)
            callback(null, '/');
        else
            resource.webName(function (e, name) {
                _this.getResourcePath(resource.parent, function (e, parentName) {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                });
            });
    };
    MethodCallArgs.prototype.writeXML = function (xmlObject) {
        var content = XML_1.XML.toXML(xmlObject);
        switch (this.accept([/[^a-z0-9A-Z]xml$/, /[^a-z0-9A-Z]json$/])) {
            default:
            case 0:
                this.response.setHeader('Content-Type', 'application/xml; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
            case 1:
                content = XML_1.XML.toJSON(content);
                this.response.setHeader('Content-Type', 'application/json; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
        }
    };
    MethodCallArgs.prototype.setCode = function (code, message) {
        if (!message)
            message = http.STATUS_CODES[code];
        if (!message) {
            this.response.statusCode = code;
        }
        else {
            this.response.statusCode = code;
            this.response.statusMessage = message;
        }
    };
    return MethodCallArgs;
}());
exports.MethodCallArgs = MethodCallArgs;
exports.default = MethodCallArgs;
