"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPDigestAuthentication_1 = require("../../user/v1/authentication/HTTPDigestAuthentication");
var FakePrivilegeManager_1 = require("../../user/v1/privilege/FakePrivilegeManager");
var SimpleUserManager_1 = require("../../user/v1/simple/SimpleUserManager");
var RootResource_1 = require("../../resource/v1/std/RootResource");
var WebDAVServerOptions = /** @class */ (function () {
    function WebDAVServerOptions() {
        this.requireAuthentification = false;
        this.httpAuthentication = new HTTPDigestAuthentication_1.HTTPDigestAuthentication('default realm');
        this.privilegeManager = new FakePrivilegeManager_1.FakePrivilegeManager();
        this.rootResource = new RootResource_1.RootResource();
        this.userManager = new SimpleUserManager_1.SimpleUserManager();
        this.lockTimeout = 3600;
        this.strictMode = false;
        this.canChunk = true;
        this.hostname = '::';
        this.https = null;
        this.port = 1900;
        this.serverName = 'webdav-server';
        this.version = '1.8.0';
        this.autoSave = null;
        this.autoLoad = null;
    }
    return WebDAVServerOptions;
}());
exports.WebDAVServerOptions = WebDAVServerOptions;
exports.default = WebDAVServerOptions;
function setDefaultServerOptions(options) {
    var def = new WebDAVServerOptions();
    if (!options)
        return def;
    for (var name_1 in def)
        if (options[name_1] === undefined)
            options[name_1] = def[name_1];
    return options;
}
exports.setDefaultServerOptions = setDefaultServerOptions;
