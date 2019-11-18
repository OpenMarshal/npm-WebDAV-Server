"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StorageManager_1 = require("../../manager/v2/fileSystem/StorageManager");
var HTTPDigestAuthentication_1 = require("../../user/v2/authentication/HTTPDigestAuthentication");
var VirtualFileSystem_1 = require("../../manager/v2/instances/VirtualFileSystem");
var SimpleUserManager_1 = require("../../user/v2/simple/SimpleUserManager");
var PrivilegeManager_1 = require("../../user/v2/privilege/PrivilegeManager");
var npmPackage_1 = require("../../helper/v2/npmPackage");
var WebDAVServerOptions = /** @class */ (function () {
    function WebDAVServerOptions() {
        this.requireAuthentification = false;
        this.httpAuthentication = new HTTPDigestAuthentication_1.HTTPDigestAuthentication(new SimpleUserManager_1.SimpleUserManager(), 'default realm');
        this.privilegeManager = new PrivilegeManager_1.PrivilegeManager();
        this.rootFileSystem = new VirtualFileSystem_1.VirtualFileSystem();
        this.lockTimeout = 3600;
        this.strictMode = false;
        this.hostname = '::';
        this.https = null;
        this.port = 1900;
        this.serverName = 'webdav-server';
        this.version = undefined;
        this.autoSave = null;
        this.autoLoad = null;
        this.storageManager = new StorageManager_1.NoStorageManager();
        this.enableLocationTag = false;
        this.maxRequestDepth = 1;
        this.respondWithPaths = false;
    }
    return WebDAVServerOptions;
}());
exports.WebDAVServerOptions = WebDAVServerOptions;
exports.default = WebDAVServerOptions;
function setDefaultServerOptions(options) {
    var defaultOptions = new WebDAVServerOptions();
    if (!options)
        options = {};
    for (var name_1 in defaultOptions) {
        if (options[name_1] === undefined)
            options[name_1] = defaultOptions[name_1];
    }
    if (!options.version) {
        npmPackage_1.getPackageData(function (e, pkg) {
            if (pkg && !options.version && pkg.version)
                options.version = pkg.version;
        });
    }
    return options;
}
exports.setDefaultServerOptions = setDefaultServerOptions;
