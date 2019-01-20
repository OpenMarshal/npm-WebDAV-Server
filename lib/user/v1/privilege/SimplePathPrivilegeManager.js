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
var SimplePrivilegeManager_1 = require("./SimplePrivilegeManager");
var IPrivilegeManager_1 = require("./IPrivilegeManager");
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
function checker(sppm, right) {
    return function (arg, resource, callback) { return callback(null, sppm.can(arg.user, arg.uri, right)); };
}
function checkerNoLock(sppm, right) {
    return function (arg, resource, callback) {
        if (!sppm.can(arg.user, arg.uri, right))
            callback(null, false);
        else
            IPrivilegeManager_1.hasNoWriteLock(arg, resource, callback);
    };
}
var SimplePathPrivilegeManager = /** @class */ (function (_super) {
    __extends(SimplePathPrivilegeManager, _super);
    function SimplePathPrivilegeManager() {
        var _this = _super.call(this) || this;
        _this.canCreate = checker(_this, 'canCreate');
        _this.canDelete = checkerNoLock(_this, 'canDelete');
        _this.canWrite = checkerNoLock(_this, 'canWrite');
        _this.canSource = checker(_this, 'canSource');
        _this.canRead = checker(_this, 'canRead');
        _this.canListLocks = checker(_this, 'canListLocks');
        _this.canSetLock = checkerNoLock(_this, 'canSetLock');
        _this.canGetAvailableLocks = checker(_this, 'canGetAvailableLocks');
        _this.canAddChild = checkerNoLock(_this, 'canAddChild');
        _this.canRemoveChild = checkerNoLock(_this, 'canRemoveChild');
        _this.canGetChildren = checker(_this, 'canGetChildren');
        _this.canSetProperty = checkerNoLock(_this, 'canSetProperty');
        _this.canGetProperty = checker(_this, 'canGetProperty');
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
    SimplePathPrivilegeManager.prototype.can = function (user, path, right) {
        var rights = this.getRights(user, path);
        var r = rights && (rights.indexOf('all') !== -1 || rights.indexOf(right) !== -1);
        return r;
    };
    return SimplePathPrivilegeManager;
}(SimplePrivilegeManager_1.SimplePrivilegeManager));
exports.SimplePathPrivilegeManager = SimplePathPrivilegeManager;
