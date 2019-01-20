"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
[DAV:, all] (aggregate, abstract)
    |
    +-- [DAV:, read] (aggregate)
            |
            +-- [DAV:, read-acl] (abstract)
            +-- [DAV:, read-current-user-privilege-set] (abstract)
    |
    +-- [DAV:, write] (aggregate)
            |
            +-- [DAV:, write-acl] (abstract)
            +-- [DAV:, write-properties]
            +-- [DAV:, write-content]
    |
    +-- [DAV:, unlock]
*/
var Privilege = /** @class */ (function () {
    function Privilege(name, description, isAbstract, subPrivileges) {
        this.description = description;
        this.isAbstract = isAbstract;
        this.isAll = subPrivileges && subPrivileges.constructor === Boolean ? subPrivileges : false;
        if (!subPrivileges || subPrivileges.constructor !== Array)
            subPrivileges = [];
        var subPrivilegesCast = subPrivileges;
        if (name.constructor === Privilege)
            this.name = name.name;
        else
            this.name = name;
        subPrivilegesCast.push(this.name);
        this.subPrivileges = subPrivilegesCast.map(function (p) { return p.constructor === Privilege ? p.name : p; });
    }
    Privilege.prototype.can = function (operation) {
        return this.isAll || this.subPrivileges.some(function (p) { return p === operation; });
    };
    Privilege.prototype.toString = function () {
        return this.name;
    };
    Privilege.all = new Privilege('DAV:all', 'Any operation', true, true);
    Privilege.readACL = new Privilege('DAV:read-acl', 'Read ACL', true);
    Privilege.readCurrentUserPrivilegeSet = new Privilege('DAV:read-current-user-privilege-set', 'Read current user privilege set property', true);
    Privilege.read = new Privilege('DAV:read', 'Read any object', false, [Privilege.readACL, Privilege.readCurrentUserPrivilegeSet]);
    Privilege.writeACL = new Privilege('DAV:write-acl', 'Write ACL', true);
    Privilege.writeProperties = new Privilege('DAV:write-properties', 'Write properties', false);
    Privilege.writeContent = new Privilege('DAV:write-content', 'Write resource content', false);
    Privilege.write = new Privilege('DAV:write', 'Write any object', false, [Privilege.writeACL, Privilege.writeProperties, Privilege.writeContent]);
    Privilege.unlock = new Privilege('DAV:unlock', 'Unlock resource', false);
    return Privilege;
}());
exports.Privilege = Privilege;
