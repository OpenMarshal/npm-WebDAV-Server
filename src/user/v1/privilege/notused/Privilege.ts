import { IPrivilege } from './IPrivilege'

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

export class Privilege implements IPrivilege
{
    static all = new Privilege('DAV:all', 'Any operation', true, true)

    static readACL = new Privilege('DAV:read-acl', 'Read ACL', true)
    static readCurrentUserPrivilegeSet = new Privilege('DAV:read-current-user-privilege-set', 'Read current user privilege set property', true)
    static read = new Privilege('DAV:read', 'Read any object', false, [ Privilege.readACL, Privilege.readCurrentUserPrivilegeSet ])

    static writeACL = new Privilege('DAV:write-acl', 'Write ACL', true)
    static writeProperties = new Privilege('DAV:write-properties', 'Write properties', false)
    static writeContent = new Privilege('DAV:write-content', 'Write resource content', false)
    static write = new Privilege('DAV:write', 'Write any object', false, [ Privilege.writeACL, Privilege.writeProperties, Privilege.writeContent ])

    static unlock = new Privilege('DAV:unlock', 'Unlock resource', false)

    subPrivileges : string[]    // Privileges included by this privilege (always include self)
    description : string        // Text to display to human users
    isAbstract : boolean        // RFC3744 : true = cannot be used as a standalone privilege
    isAll : boolean             // true = includes all privileges
    name : string               // unique name of the privilege (might be used in resources as id)

    constructor(name : string | Privilege, description : string, isAbstract : boolean, subPrivileges ?: (string | Privilege)[])
    constructor(name : string | Privilege, description : string, isAbstract : boolean, isAll ?: boolean)
    constructor(name : string | Privilege, description : string, isAbstract : boolean, subPrivileges ?: (string | Privilege)[] | boolean)
    {
        this.description = description;
        this.isAbstract = isAbstract;
        this.isAll = subPrivileges && subPrivileges.constructor === Boolean ? subPrivileges as boolean : false;

        if(!subPrivileges || subPrivileges.constructor !== Array)
            subPrivileges = [];
        const subPrivilegesCast = subPrivileges as (string | Privilege)[];
        
        if(name.constructor === Privilege)
            this.name = (name as Privilege).name;
        else
            this.name = name as string;
        
        subPrivilegesCast.push(this.name);
        this.subPrivileges = subPrivilegesCast.map((p) => p.constructor === Privilege ? (p as Privilege).name : p as string);
    }

    can(operation : string) : boolean
    {
        return this.isAll || this.subPrivileges.some((p) => p === operation);
    }

    toString()
    {
        return this.name;
    }
}
