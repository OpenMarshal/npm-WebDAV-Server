"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IPrivilegeManager_1 = require("../../user/v1/privilege/IPrivilegeManager");
var xml_js_builder_1 = require("xml-js-builder");
var IfParser_1 = require("../../helper/v1/IfParser");
var HTTPCodes_1 = require("../HTTPCodes");
var FSManager_1 = require("../../manager/v1/FSManager");
var Errors_1 = require("../../Errors");
var http = require("http");
var url = require("url");
var MethodCallArgs = /** @class */ (function () {
    function MethodCallArgs(server, request, response, exit, callback) {
        this.server = server;
        this.request = request;
        this.response = response;
        this.exit = exit;
        this.callback = callback;
        this.contentLength = parseInt(this.findHeader('Content-length', '0'), 10);
        this.isSource = this.findHeader('source', 'F').toUpperCase() === 'T' || this.findHeader('translate', 'T').toUpperCase() === 'F';
        this.depth = parseInt(this.findHeader('Depth', '0'), 10);
        this.host = this.findHeader('Host');
        this.uri = url.parse(request.url).pathname;
        this.path = new FSManager_1.FSPath(this.uri);
    }
    MethodCallArgs.create = function (server, request, response, callback) {
        var mca = new MethodCallArgs(server, request, response, null, null);
        response.setHeader('DAV', '1,2');
        response.setHeader('Server', server.options.serverName + '/' + server.options.version);
        mca.askForAuthentication(false, function (e) {
            if (e) {
                callback(e, mca);
                return;
            }
            server.httpAuthentication.getUser(mca, server.userManager, function (e, user) {
                mca.user = user;
                if (e && e !== Errors_1.Errors.UserNotFound) {
                    if (server.options.requireAuthentification || e !== Errors_1.Errors.MissingAuthorisationHeader) {
                        callback(e, mca);
                        return;
                    }
                }
                if (server.options.requireAuthentification && (!user || user.isDefaultUser || e === Errors_1.Errors.UserNotFound)) {
                    callback(Errors_1.Errors.MissingAuthorisationHeader, mca);
                    return;
                }
                server.getResourceFromPath(mca, mca.uri, function (e, r) {
                    if (e || !r) {
                        setAllowHeader();
                        return;
                    }
                    mca.resource = r;
                    r.type(function (e, type) {
                        if (e || !type) {
                            setAllowHeader();
                            return;
                        }
                        mca.resourceType = type;
                        setAllowHeader(type);
                    });
                });
            });
        });
        function setAllowHeader(type) {
            var allowedMethods = [];
            for (var name_1 in server.methods) {
                var method = server.methods[name_1];
                if (!method.isValidFor || method.isValidFor(type))
                    allowedMethods.push(name_1.toUpperCase());
            }
            response.setHeader('Allow', allowedMethods.join(','));
            callback(null, mca);
        }
    };
    MethodCallArgs.prototype.noBodyExpected = function (callback) {
        if (this.server.options.strictMode && this.contentLength !== 0) {
            this.setCode(HTTPCodes_1.HTTPCodes.UnsupportedMediaType);
            this.exit();
        }
        else
            callback();
    };
    MethodCallArgs.prototype.checkIfHeader = function (defaultResource, callback) {
        var _this = this;
        var ifHeader = this.findHeader('If');
        if (!ifHeader) {
            callback();
            return;
        }
        IfParser_1.parseIfHeader(ifHeader)(this, defaultResource, function (e, passed) {
            if (e) {
                _this.setCode(HTTPCodes_1.HTTPCodes.InternalServerError);
                _this.exit();
            }
            else if (!passed) {
                _this.setCode(HTTPCodes_1.HTTPCodes.PreconditionFailed);
                _this.exit();
            }
            else
                callback();
        });
    };
    MethodCallArgs.prototype.requireCustomPrivilege = function (privileges, resource, callback) {
        var _this = this;
        IPrivilegeManager_1.requirePrivilege(privileges, this, resource, function (e, can) {
            if (e) {
                _this.setCode(HTTPCodes_1.HTTPCodes.InternalServerError);
                _this.exit();
                return;
            }
            if (!can) {
                _this.setCode(HTTPCodes_1.HTTPCodes.Unauthorized);
                _this.exit();
                return;
            }
            callback();
        });
    };
    MethodCallArgs.prototype.requirePrivilege = function (privileges, resource, callback) {
        this.requireCustomPrivilege(privileges, resource, callback);
    };
    MethodCallArgs.prototype.requireErCustomPrivilege = function (privileges, resource, callback) {
        IPrivilegeManager_1.requirePrivilege(privileges, this, resource, callback);
    };
    MethodCallArgs.prototype.requireErPrivilege = function (privileges, resource, callback) {
        this.requireErCustomPrivilege(privileges, resource, callback);
    };
    MethodCallArgs.prototype.askForAuthentication = function (checkForUser, callback) {
        if (checkForUser && this.user !== null && !this.user.isDefaultUser) {
            callback(Errors_1.Errors.AlreadyAuthenticated);
            return;
        }
        var auth = this.server.httpAuthentication.askForAuthentication();
        for (var name_2 in auth)
            this.response.setHeader(name_2, auth[name_2]);
        callback(null);
    };
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
                return this.request.headers[k].toString();
        return defaultValue;
    };
    MethodCallArgs.prototype.getResource = function (callback) {
        callback(!this.resource ? Errors_1.Errors.ResourceNotFound : null, this.resource);
    };
    MethodCallArgs.prototype.dateISO8601 = function (ticks) {
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
    };
    MethodCallArgs.prototype.invokeEvent = function (event, subjectResource, details) {
        this.server.invoke(event, this, subjectResource, details);
    };
    MethodCallArgs.prototype.wrapEvent = function (event, subjectResource, details) {
        var _this = this;
        var oldExit = this.exit;
        this.exit = function () {
            if (Math.floor(_this.response.statusCode / 100) === 2)
                _this.invokeEvent(event, subjectResource, details);
            oldExit();
        };
        return this.exit;
    };
    MethodCallArgs.prototype.fullUri = function (uri) {
        if (uri === void 0) { uri = null; }
        if (!uri)
            uri = this.uri;
        return (this.prefixUri() + uri).replace(/([^:])\/\//g, '$1/');
    };
    MethodCallArgs.prototype.prefixUri = function () {
        return 'http://' + this.host.replace('/', '');
    };
    MethodCallArgs.prototype.getResourcePath = function (resource, callback) {
        var _this = this;
        if (!resource.parent)
            callback(null, '/');
        else
            resource.webName(function (e, name) { return process.nextTick(function () {
                _this.getResourcePath(resource.parent, function (e, parentName) {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                });
            }); });
    };
    MethodCallArgs.prototype.writeXML = function (xmlObject) {
        var content = xml_js_builder_1.XML.toXML(xmlObject);
        switch (this.accept([/[^a-z0-9A-Z]xml$/, /[^a-z0-9A-Z]json$/])) {
            default:
            case 0: // xml
                this.response.setHeader('Content-Type', 'application/xml; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
            case 1: // json
                content = xml_js_builder_1.XML.toJSON(content);
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
