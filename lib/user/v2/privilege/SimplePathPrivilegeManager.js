"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PrivilegeManager_1 = require("./PrivilegeManager");
var export_1 = require("../../../manager/v2/export");
function standarizePath(path) {
    if (!path)
        path = '/';
    var startIndex = path.indexOf('://');
    if (startIndex !== -1) {
        path = path.substr(startIndex + 3);
        path = path.substr(path.indexOf('/') + 1);
    }
    path = path.replace(/\\/g, '/');
    var rex = /\/\//g;
    while (rex.test(path))
        path = path.replace(rex, '/');
    path = path.replace(/\/$/g, '');
    path = path.replace(/^([^\/])/g, '/$1');
    if (path.length === 0)
        path = '/';
    return path;
}
var SimplePathPrivilegeManager = (function (_super) {
    __extends(SimplePathPrivilegeManager, _super);
    function SimplePathPrivilegeManager() {
        var _this = _super.call(this) || this;
        _this.rights = {};
        return _this;
    }
    SimplePathPrivilegeManager.prototype.setRights = function (user, path, rights) {
        if (!this.rights[user.uid])
            this.rights[user.uid] = {};
        this.rights[user.uid][standarizePath(path)] = rights;
    };
    SimplePathPrivilegeManager.prototype.getRights = function (user, path) {
        if (!this.rights[user.uid])
            return [];
        return this.rights[user.uid][standarizePath(path)];
    };
    SimplePathPrivilegeManager.prototype._can = function (fuullPath, resource, privilege, callback) {
        var rights = this.getRights(resource.context.user, export_1.Path.toString());
        callback(null, rights && (rights.indexOf('all') !== -1 || rights.some(function (r) { return r === 'all' || r === privilege; })));
    };
    return SimplePathPrivilegeManager;
}(PrivilegeManager_1.PrivilegeManager));
exports.SimplePathPrivilegeManager = SimplePathPrivilegeManager;
