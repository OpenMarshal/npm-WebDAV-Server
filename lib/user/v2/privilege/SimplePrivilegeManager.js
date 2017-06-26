"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimplePrivilegeManager = (function () {
    function SimplePrivilegeManager() {
        var _this = this;
        this.canMove = function (ctx, resource, callback) {
            _this.canDelete(ctx, resource, function (e, v) {
                if (e || !v)
                    callback(e, v);
                else
                    _this.canRead(ctx, resource, callback);
            });
        };
        this.canRename = function (ctx, resource, callback) { return _this.canWrite(ctx, resource, callback); };
        this.canAppend = function (ctx, resource, callback) { return _this.canWrite(ctx, resource, callback); };
        this.canGetMimeType = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
        this.canGetSize = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
        this.canRemoveLock = function (ctx, resource, callback) { return _this.canSetLock(ctx, resource, callback); };
        this.canGetLock = function (ctx, resource, callback) { return _this.canListLocks(ctx, resource, callback); };
        this.canGetProperties = function (ctx, resource, callback) { return _this.canGetProperty(ctx, resource, callback); };
        this.canRemoveProperty = function (ctx, resource, callback) { return _this.canSetProperty(ctx, resource, callback); };
        this.canGetCreationDate = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
        this.canGetLastModifiedDate = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
        this.canGetWebName = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
        this.canGetType = function (ctx, resource, callback) { return _this.canRead(ctx, resource, callback); };
    }
    return SimplePrivilegeManager;
}());
exports.SimplePrivilegeManager = SimplePrivilegeManager;
