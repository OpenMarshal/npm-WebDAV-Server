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
var FakePrivilegeManager = /** @class */ (function (_super) {
    __extends(FakePrivilegeManager, _super);
    function FakePrivilegeManager() {
        var _this = _super.call(this) || this;
        _this.canCreate = function (arg, resource, callback) { return callback(null, true); };
        _this.canDelete = IPrivilegeManager_1.hasNoWriteLock;
        _this.canWrite = IPrivilegeManager_1.hasNoWriteLock;
        _this.canSource = function (arg, resource, callback) { return callback(null, true); };
        _this.canRead = function (arg, resource, callback) { return callback(null, true); };
        _this.canListLocks = function (arg, resource, callback) { return callback(null, true); };
        _this.canSetLock = IPrivilegeManager_1.hasNoWriteLock;
        _this.canGetAvailableLocks = function (arg, resource, callback) { return callback(null, true); };
        _this.canAddChild = IPrivilegeManager_1.hasNoWriteLock;
        _this.canRemoveChild = IPrivilegeManager_1.hasNoWriteLock;
        _this.canGetChildren = function (arg, resource, callback) { return callback(null, true); };
        _this.canSetProperty = IPrivilegeManager_1.hasNoWriteLock;
        _this.canGetProperty = function (arg, resource, callback) { return callback(null, true); };
        return _this;
    }
    return FakePrivilegeManager;
}(SimplePrivilegeManager_1.SimplePrivilegeManager));
exports.FakePrivilegeManager = FakePrivilegeManager;
