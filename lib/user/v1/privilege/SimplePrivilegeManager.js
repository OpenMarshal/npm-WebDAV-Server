"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimplePrivilegeManager = /** @class */ (function () {
    function SimplePrivilegeManager() {
        var _this = this;
        this.canMove = function (arg, resource, callback) {
            _this.canDelete(arg, resource, function (e, v) {
                if (e || !v)
                    callback(e, v);
                else
                    _this.canRead(arg, resource, callback);
            });
        };
        this.canRename = function (arg, resource, callback) { return _this.canWrite(arg, resource, callback); };
        this.canAppend = function (arg, resource, callback) { return _this.canWrite(arg, resource, callback); };
        this.canGetMimeType = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
        this.canGetSize = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
        this.canRemoveLock = function (arg, resource, callback) { return _this.canSetLock(arg, resource, callback); };
        this.canGetLock = function (arg, resource, callback) { return _this.canListLocks(arg, resource, callback); };
        this.canGetProperties = function (arg, resource, callback) { return _this.canGetProperty(arg, resource, callback); };
        this.canRemoveProperty = function (arg, resource, callback) { return _this.canSetProperty(arg, resource, callback); };
        this.canGetCreationDate = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
        this.canGetLastModifiedDate = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
        this.canGetWebName = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
        this.canGetType = function (arg, resource, callback) { return _this.canRead(arg, resource, callback); };
    }
    return SimplePrivilegeManager;
}());
exports.SimplePrivilegeManager = SimplePrivilegeManager;
