"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LockType_1 = require("../../../resource/v1/lock/LockType");
function requirePrivilege(privilege, arg, resource, callback) {
    var privileges = privilege.constructor !== Array ? [privilege] : privilege;
    var pm = arg.server.privilegeManager;
    go();
    function go(error, hasAccess) {
        if (error === void 0) { error = null; }
        if (hasAccess === void 0) { hasAccess = true; }
        if (privileges.length === 0 || error || !hasAccess) {
            process.nextTick(function () { return callback(error, hasAccess); });
            return;
        }
        process.nextTick(function () { return pm[privileges.shift()](arg, resource, go); });
    }
}
exports.requirePrivilege = requirePrivilege;
function hasNoWriteLock(arg, resource, callback) {
    resource.getLocks(function (e, locks) {
        var hasNoLock = locks ? locks.filter(function (l) { return (!l.userUid || l.userUid !== arg.user.uid) && l.lockKind.type.isSame(LockType_1.LockType.Write); }).length === 0 : false;
        if (!hasNoLock || !resource.parent)
            callback(e, hasNoLock);
        else
            hasNoWriteLock(arg, resource.parent, callback);
    });
}
exports.hasNoWriteLock = hasNoWriteLock;
