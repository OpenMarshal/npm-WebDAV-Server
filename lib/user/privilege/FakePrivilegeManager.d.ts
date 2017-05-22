import { SimplePrivilegeManager } from './SimplePrivilegeManager';
import { hasNoWriteLock } from './IPrivilegeManager';
export declare class FakePrivilegeManager extends SimplePrivilegeManager {
    constructor();
    canCreate: (arg: any, resource: any, callback: any) => any;
    canDelete: typeof hasNoWriteLock;
    canWrite: typeof hasNoWriteLock;
    canSource: (arg: any, resource: any, callback: any) => any;
    canRead: (arg: any, resource: any, callback: any) => any;
    canListLocks: (arg: any, resource: any, callback: any) => any;
    canSetLock: typeof hasNoWriteLock;
    canGetAvailableLocks: (arg: any, resource: any, callback: any) => any;
    canAddChild: typeof hasNoWriteLock;
    canRemoveChild: typeof hasNoWriteLock;
    canGetChildren: (arg: any, resource: any, callback: any) => any;
    canSetProperty: typeof hasNoWriteLock;
    canGetProperty: (arg: any, resource: any, callback: any) => any;
}
