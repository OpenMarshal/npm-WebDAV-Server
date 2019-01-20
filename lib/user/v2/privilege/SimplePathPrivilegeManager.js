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
var PrivilegeManager_1 = require("./PrivilegeManager");
var JSCompatibility_1 = require("../../../helper/JSCompatibility");
var Errors_1 = require("../../../Errors");
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
var SimplePathPrivilegeManager = /** @class */ (function (_super) {
    __extends(SimplePathPrivilegeManager, _super);
    function SimplePathPrivilegeManager() {
        var _this = _super.call(this) || this;
        _this.rights = {};
        return _this;
    }
    SimplePathPrivilegeManager.prototype.setRights = function (user, path, rights) {
        if (!user)
            throw Errors_1.Errors.IllegalArguments;
        if (!this.rights[user.uid])
            this.rights[user.uid] = {};
        var rs = rights;
        if (rs.indexOf('canRead') !== -1) {
            rs.push('canReadLocks');
            rs.push('canReadContent');
            rs.push('canReadProperties');
        }
        if (rs.indexOf('canReadContent') !== -1) {
            rs.push('canReadContentTranslated');
            rs.push('canReadContentSource');
        }
        if (rs.indexOf('canWrite') !== -1) {
            rs.push('canWriteLocks');
            rs.push('canWriteContent');
            rs.push('canWriteProperties');
        }
        if (rs.indexOf('canWriteContent') !== -1) {
            rs.push('canWriteContentTranslated');
            rs.push('canWriteContentSource');
        }
        this.rights[user.uid][standarizePath(path)] = rights;
    };
    SimplePathPrivilegeManager.prototype.getRights = function (user, path) {
        if (!user)
            return [];
        var allRights = this.rights[user.uid];
        if (!allRights)
            return [];
        path = standarizePath(path.toString());
        var rights = {};
        for (var superPath in allRights) {
            if (JSCompatibility_1.startsWith(path, superPath)) {
                for (var _i = 0, _a = allRights[superPath]; _i < _a.length; _i++) {
                    var right = _a[_i];
                    rights[right] = true;
                }
            }
        }
        return Object.keys(rights);
    };
    SimplePathPrivilegeManager.prototype._can = function (fullPath, user, resource, privilege, callback) {
        if (!user)
            return callback(null, false);
        var rights = this.getRights(user, fullPath.toString());
        var can = !!rights && rights.some(function (r) { return r === 'all' || r === privilege; });
        callback(null, can);
    };
    return SimplePathPrivilegeManager;
}(PrivilegeManager_1.PrivilegeManager));
exports.SimplePathPrivilegeManager = SimplePathPrivilegeManager;
