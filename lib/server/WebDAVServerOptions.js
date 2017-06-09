"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPBasicAuthentication_1 = require("../user/authentication/HTTPBasicAuthentication");
var FakePrivilegeManager_1 = require("../user/privilege/FakePrivilegeManager");
var SimpleUserManager_1 = require("../user/simple/SimpleUserManager");
var RootResource_1 = require("../resource/std/RootResource");
var WebDAVServerOptions = (function () {
    function WebDAVServerOptions() {
        this.requireAuthentification = false;
        this.httpAuthentication = new HTTPBasicAuthentication_1.HTTPBasicAuthentication('default realm');
        this.privilegeManager = new FakePrivilegeManager_1.FakePrivilegeManager();
        this.rootResource = new RootResource_1.RootResource();
        this.userManager = new SimpleUserManager_1.SimpleUserManager();
        this.lockTimeout = 3600;
        this.canChunk = true;
        this.hostname = '::';
        this.port = 1900;
        this.strictMode = false;
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
