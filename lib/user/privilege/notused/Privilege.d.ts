import { IPrivilege } from './IPrivilege';
export declare class Privilege implements IPrivilege {
    static all: Privilege;
    static readACL: Privilege;
    static readCurrentUserPrivilegeSet: Privilege;
    static read: Privilege;
    static writeACL: Privilege;
    static writeProperties: Privilege;
    static writeContent: Privilege;
    static write: Privilege;
    static unlock: Privilege;
    subPrivileges: string[];
    description: string;
    isAbstract: boolean;
    isAll: boolean;
    name: string;
    constructor(name: string | Privilege, description: string, isAbstract: boolean, subPrivileges?: (string | Privilege)[]);
    constructor(name: string | Privilege, description: string, isAbstract: boolean, isAll?: boolean);
    can(operation: string): boolean;
    toString(): string;
}
