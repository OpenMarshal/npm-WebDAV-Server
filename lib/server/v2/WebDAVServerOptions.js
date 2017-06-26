"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPDigestAuthentication_1 = require("../../user/v2/authentication/HTTPDigestAuthentication");
var FakePrivilegeManager_1 = require("../../user/v2/privilege/FakePrivilegeManager");
var SimpleUserManager_1 = require("../../user/v2/simple/SimpleUserManager");
var VirtualFileSystem_1 = require("../../manager/v2/instances/VirtualFileSystem");
var WebDAVServerOptions = (function () {
    function WebDAVServerOptions() {
        this.requireAuthentification = false;
        this.httpAuthentication = new HTTPDigestAuthentication_1.HTTPDigestAuthentication(new SimpleUserManager_1.SimpleUserManager(), 'default realm');
        this.privilegeManager = new FakePrivilegeManager_1.FakePrivilegeManager();
        this.rootFileSystem = new VirtualFileSystem_1.VirtualFileSystem();
        this.lockTimeout = 3600;
        this.strictMode = false;
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
