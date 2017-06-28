"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var export_1 = require("../../../manager/v2/export");
var Workflow_1 = require("../../../helper/Workflow");
function checkAll(pm, fns, resource, callback) {
    new Workflow_1.Workflow()
        .each(fns, function (fn, cb) { return fn.bind(pm)(resource, cb); })
        .error(function (e) { return callback(e, false); })
        .done(function (successes) { return callback(null, successes.every(function (b) { return !!b; })); });
}
var PrivilegeManager = (function () {
    function PrivilegeManager() {
    }
    PrivilegeManager.prototype.can = function (_fullPath, resource, _privilege, callback) {
        var _this = this;
        if (_privilege.constructor !== String) {
            new Workflow_1.Workflow()
                .each(_privilege, function (privilege, cb) { return _this.can(_fullPath, resource, privilege, cb); })
                .error(function (e) { return callback(e, false); })
                .done(function (checks) { return callback(null, checks.every(function (b) { return !!b; })); });
            return;
        }
        var fullPath = new export_1.Path(_fullPath);
        var privilege = _privilege;
        if (this._can)
            return this._can(fullPath, resource, privilege, callback);
        var method = this[privilege];
        if (method)
            method(fullPath, resource, callback);
        else
            callback(null, true);
    };
    PrivilegeManager.prototype.canWrite = function (fullPath, resource, callback) {
        checkAll(this, [
            this.canWriteLocks,
            this.canWriteContent,
            this.canWriteProperties
        ], resource, callback);
    };
    PrivilegeManager.prototype.canWriteLocks = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canWriteContent = function (fullPath, resource, callback) {
        checkAll(this, [
            this.canWriteContentSource,
            this.canWriteContentTranslated
        ], resource, callback);
    };
    PrivilegeManager.prototype.canWriteContentTranslated = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canWriteContentSource = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canWriteProperties = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canRead = function (fullPath, resource, callback) {
        checkAll(this, [
            this.canReadLocks,
            this.canReadContent,
            this.canReadProperties
        ], resource, callback);
    };
    PrivilegeManager.prototype.canReadLocks = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canReadContent = function (fullPath, resource, callback) {
        checkAll(this, [
            this.canReadContentSource,
            this.canReadContentTranslated
        ], resource, callback);
    };
    PrivilegeManager.prototype.canReadContentTranslated = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canReadContentSource = function (fullPath, resource, callback) {
        callback(null, true);
    };
    PrivilegeManager.prototype.canReadProperties = function (fullPath, resource, callback) {
        callback(null, true);
    };
    return PrivilegeManager;
}());
exports.PrivilegeManager = PrivilegeManager;
