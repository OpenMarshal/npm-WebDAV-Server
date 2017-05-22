"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockType_1 = require("../../resource/lock/LockType");
function requirePrivilege(privilege, arg, resource, callback) {
    var privileges = privilege.constructor !== Array ? [privilege] : privilege;
    var pm = arg.server.privilegeManager;
    go();
    function go(error, hasAccess) {
        if (error === void 0) { error = null; }
        if (hasAccess === void 0) { hasAccess = true; }
        if (privileges.length === 0 || error || !hasAccess) {
            callback(error, hasAccess);
            return;
        }
        pm[privileges.shift()](arg, resource, go);
    }
}
exports.requirePrivilege = requirePrivilege;
function hasNoWriteLock(arg, resource, callback) {
    resource.getLocks(function (e, locks) {
        var hasNoLock = locks ? locks.filter(function (l) { return l.user !== arg.user && l.lockKind.type.isSame(LockType_1.LockType.Write); }).length === 0 : false;
        if (!hasNoLock || !resource.parent)
            callback(e, hasNoLock);
        else
            hasNoWriteLock(arg, resource.parent, callback);
    });
}
exports.hasNoWriteLock = hasNoWriteLock;
