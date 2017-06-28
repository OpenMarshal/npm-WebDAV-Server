import { SimplePrivilegeManager } from './SimplePrivilegeManager';
export declare class FakePrivilegeManager extends SimplePrivilegeManager {
    constructor();
    canCreate: (arg: any, resource: any, callback: any) => any;
    canDelete: any;
    canWrite: any;
    canSource: (arg: any, resource: any, callback: any) => any;
    canRead: (arg: any, resource: any, callback: any) => any;
    canListLocks: (arg: any, resource: any, callback: any) => any;
    canSetLock: any;
    canGetAvailableLocks: (arg: any, resource: any, callback: any) => any;
    canAddChild: any;
    canRemoveChild: any;
    canGetChildren: (arg: any, resource: any, callback: any) => any;
    canSetProperty: any;
    canGetProperty: (arg: any, resource: any, callback: any) => any;
}
