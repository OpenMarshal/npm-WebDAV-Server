"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_builder_1 = require("xml-js-builder");
var IfParser_1 = require("../../helper/v2/IfParser");
var HTTPCodes_1 = require("../HTTPCodes");
var Path_1 = require("../../manager/v2/Path");
var Errors_1 = require("../../Errors");
var http = require("http");
var url = require("url");
var RequestContextHeaders = /** @class */ (function () {
    function RequestContextHeaders(headers) {
        this.headers = headers;
        this.isSource = this.find('source', 'F').toUpperCase() === 'T' || this.find('translate', 'T').toUpperCase() === 'F';
        this.host = this.find('Host', 'localhost');
        var depth = this.find('Depth');
        try {
            if (depth.toLowerCase() === 'infinity')
                this.depth = -1;
            else
                this.depth = Math.max(-1, parseInt(depth, 10));
        }
        catch (_) {
            this.depth = undefined;
        }
        try {
            this.contentLength = Math.max(0, parseInt(this.find('Content-length', '0'), 10));
        }
        catch (_) {
            this.contentLength = 0;
        }
    }
    RequestContextHeaders.prototype.find = function (name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        name = name.replace(/(-| )/g, '').toLowerCase();
        for (var k in this.headers)
            if (k.replace(/(-| )/g, '').toLowerCase() === name) {
                var value = this.headers[k].toString().trim();
                if (value.length !== 0)
                    return value;
            }
        return defaultValue;
    };
    RequestContextHeaders.prototype.findBestAccept = function (defaultType) {
        if (defaultType === void 0) { defaultType = 'xml'; }
        var accepts = this.find('Accept', 'text/xml').split(',');
        var regex = {
            'xml': /[^a-z0-9A-Z]xml$/,
            'json': /[^a-z0-9A-Z]json$/
        };
        for (var _i = 0, accepts_1 = accepts; _i < accepts_1.length; _i++) {
            var value = accepts_1[_i];
            for (var name_1 in regex)
                if (regex[name_1].test(value))
                    return name_1;
        }
        return defaultType;
    };
    return RequestContextHeaders;
}());
exports.RequestContextHeaders = RequestContextHeaders;
var DefaultRequestContextExternalOptions = /** @class */ (function () {
    function DefaultRequestContextExternalOptions() {
        this.headers = {
            host: 'localhost'
        };
        this.url = '/';
        this.user = {
            isAdministrator: true,
            isDefaultUser: false,
            password: null,
            uid: '-1',
            username: '_default_super_admin_'
        };
    }
    return DefaultRequestContextExternalOptions;
}());
exports.DefaultRequestContextExternalOptions = DefaultRequestContextExternalOptions;
var RequestContext = /** @class */ (function () {
    function RequestContext(server, uri, headers, rootPath) {
        this.overridePrivileges = false;
        this.rootPath = rootPath;
        this.headers = new RequestContextHeaders(headers);
        this.server = server;
        uri = url.parse(uri).pathname;
        uri = uri ? uri : '';
        this.requested = {
            uri: uri,
            path: new Path_1.Path(uri)
        };
        this.requested.path.decode();
        if (this.rootPath) {
            this.rootPath = new Path_1.Path(this.rootPath).toString(false);
            if (this.rootPath === '/')
                this.rootPath = undefined;
        }
    }
    RequestContext.prototype.getResource = function (_path, _callback) {
        var path = _callback ? new Path_1.Path(_path) : this.requested.path;
        var callback = _callback ? _callback : _path;
        this.server.getResource(this, path, callback);
    };
    RequestContext.prototype.getResourceSync = function (path) {
        path = path ? path : this.requested.path;
        return this.server.getResourceSync(this, path);
    };
    RequestContext.prototype.fullUri = function (uri) {
        if (uri === void 0) { uri = null; }
        if (!uri)
            uri = this.requested.uri;
        if (this.server.options.respondWithPaths)
            return uri;
        else
            return (this.prefixUri() + uri).replace(/([^:])\/\//g, '$1/');
    };
    RequestContext.prototype.prefixUri = function () {
        return 'http://' + this.headers.host.replace('/', '') + (this.rootPath ? this.rootPath : '');
    };
    return RequestContext;
}());
exports.RequestContext = RequestContext;
var ExternalRequestContext = /** @class */ (function (_super) {
    __extends(ExternalRequestContext, _super);
    function ExternalRequestContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExternalRequestContext.create = function (server, _options, _callback) {
        var defaultValues = new DefaultRequestContextExternalOptions();
        var options = _options && _options.constructor !== Function ? _options : defaultValues;
        var callback = _callback ? _callback : _options && _options.constructor === Function ? _options : function () { };
        if (defaultValues !== options) {
            for (var name_2 in defaultValues)
                if (options[name_2] === undefined)
                    options[name_2] = defaultValues[name_2];
        }
        var ctx = new ExternalRequestContext(server, options.url, options.headers);
        if (options.user) {
            ctx.user = options.user;
            process.nextTick(function () { return callback(null, ctx); });
        }
        return ctx;
    };
    return ExternalRequestContext;
}(RequestContext));
exports.ExternalRequestContext = ExternalRequestContext;
var HTTPRequestContext = /** @class */ (function (_super) {
    __extends(HTTPRequestContext, _super);
    function HTTPRequestContext(server, request, response, exit, rootPath) {
        var _this = _super.call(this, server, request.url, request.headers, rootPath) || this;
        _this.responseBody = undefined;
        _this.response = response;
        _this.request = request;
        _this.exit = exit;
        return _this;
    }
    HTTPRequestContext.create = function (server, request, response, _rootPath, _callback) {
        var rootPath = _callback ? _rootPath : undefined;
        var callback = _callback ? _callback : _rootPath;
        var ctx = new HTTPRequestContext(server, request, response, null, rootPath);
        response.setHeader('DAV', '1,2');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Expose-Headers', 'DAV, content-length, Allow');
        response.setHeader('MS-Author-Via', 'DAV');
        response.setHeader('Server', server.options.serverName + '/' + server.options.version);
        var setAllowHeader = function (type) {
            var allowedMethods = [];
            for (var name_3 in server.methods) {
                var method = server.methods[name_3];
                if (!method.isValidFor || method.isValidFor(ctx, type))
                    allowedMethods.push(name_3.toUpperCase());
            }
            response.setHeader('Allow', allowedMethods.join(','));
            callback(null, ctx);
        };
        ctx.askForAuthentication(false, function (e) {
            if (e) {
                callback(e, ctx);
                return;
            }
            server.httpAuthentication.getUser(ctx, function (e, user) {
                ctx.user = user;
                if (e && e !== Errors_1.Errors.UserNotFound) {
                    if (server.options.requireAuthentification || e !== Errors_1.Errors.MissingAuthorisationHeader)
                        return callback(e, ctx);
                }
                if (server.options.requireAuthentification && (!user || user.isDefaultUser || e === Errors_1.Errors.UserNotFound))
                    return callback(Errors_1.Errors.MissingAuthorisationHeader, ctx);
                server.getFileSystem(ctx.requested.path, function (fs, _, subPath) {
                    fs.type(ctx.requested.path.isRoot() ? server.createExternalContext() : ctx, subPath, function (e, type) {
                        if (e)
                            type = undefined;
                        setAllowHeader(type);
                    });
                });
            });
        });
    };
    HTTPRequestContext.encodeURL = function (url) {
        return encodeURI(url);
    };
    HTTPRequestContext.prototype.noBodyExpected = function (callback) {
        if (this.server.options.strictMode && this.headers.contentLength !== 0) {
            this.setCode(HTTPCodes_1.HTTPCodes.UnsupportedMediaType);
            this.exit();
        }
        else
            callback();
    };
    HTTPRequestContext.prototype.checkIfHeader = function (_fs, _path, _callback) {
        var _this = this;
        var fs = _callback ? _fs : null;
        var path = _callback ? _path : null;
        var resource = _callback ? null : _fs;
        var callback = _callback ? _callback : _path;
        var ifHeader = this.headers.find('If');
        if (!ifHeader) {
            callback();
            return;
        }
        if (!resource) {
            resource = fs.resource(this, path);
        }
        IfParser_1.parseIfHeader(ifHeader)(this, resource, function (e, passed) {
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
    HTTPRequestContext.prototype.askForAuthentication = function (checkForUser, callback) {
        if (checkForUser && this.user !== null && !this.user.isDefaultUser) {
            callback(Errors_1.Errors.AlreadyAuthenticated);
            return;
        }
        var auth = this.server.httpAuthentication.askForAuthentication();
        for (var name_4 in auth)
            this.response.setHeader(name_4, auth[name_4]);
        callback(null);
    };
    HTTPRequestContext.prototype.writeBody = function (xmlObject) {
        var content = xml_js_builder_1.XML.toXML(xmlObject);
        switch (this.headers.findBestAccept()) {
            default:
            case 'xml':
                this.response.setHeader('Content-Type', 'application/xml;charset=utf-8');
                this.response.setHeader('Content-Length', new Buffer(content).length.toString());
                this.response.write(content, 'UTF-8');
                break;
            case 'json':
                content = xml_js_builder_1.XML.toJSON(content);
                this.response.setHeader('Content-Type', 'application/json;charset=utf-8');
                this.response.setHeader('Content-Length', new Buffer(content).length.toString());
                this.response.write(content, 'UTF-8');
                break;
        }
        this.responseBody = content;
    };
    HTTPRequestContext.prototype.setCode = function (code, message) {
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
    HTTPRequestContext.defaultStatusCode = function (error) {
        var code = null;
        for (var _i = 0, _a = this.defaultErrorStatusCodes; _i < _a.length; _i++) {
            var errorCode = _a[_i];
            if (errorCode.error === error) {
                code = errorCode.code;
                break;
            }
        }
        return code;
    };
    HTTPRequestContext.prototype.setCodeFromError = function (error) {
        var code = HTTPRequestContext.defaultStatusCode(error);
        if (code)
            this.setCode(code);
        return !!code;
    };
    HTTPRequestContext.defaultErrorStatusCodes = [
        { error: Errors_1.Errors.ResourceNotFound, code: HTTPCodes_1.HTTPCodes.NotFound },
        { error: Errors_1.Errors.Locked, code: HTTPCodes_1.HTTPCodes.Locked },
        { error: Errors_1.Errors.BadAuthentication, code: HTTPCodes_1.HTTPCodes.Unauthorized },
        { error: Errors_1.Errors.NotEnoughPrivilege, code: HTTPCodes_1.HTTPCodes.Unauthorized },
        { error: Errors_1.Errors.ResourceAlreadyExists, code: HTTPCodes_1.HTTPCodes.Conflict },
        { error: Errors_1.Errors.IntermediateResourceMissing, code: HTTPCodes_1.HTTPCodes.Conflict },
        { error: Errors_1.Errors.WrongParentTypeForCreation, code: HTTPCodes_1.HTTPCodes.Conflict },
        { error: Errors_1.Errors.InsufficientStorage, code: HTTPCodes_1.HTTPCodes.InsufficientStorage },
        { error: Errors_1.Errors.Forbidden, code: HTTPCodes_1.HTTPCodes.Forbidden }
    ];
    return HTTPRequestContext;
}(RequestContext));
exports.HTTPRequestContext = HTTPRequestContext;
