import { SimplePrivilegeManager, SimpleBasicPrivilege } from './SimplePrivilegeManager';
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs';
import { IResource } from '../../../resource/v1/IResource';
import { IUser } from '../IUser';
export declare class SimplePathPrivilegeManager extends SimplePrivilegeManager {
    rights: any;
    constructor();
    setRights(user: IUser, path: string, rights: SimpleBasicPrivilege[]): void;
    getRights(user: IUser, path: string): SimpleBasicPrivilege[];
    can(user: IUser, path: string, right: SimpleBasicPrivilege): boolean;
    canCreate: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canDelete: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canWrite: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canSource: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canRead: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canListLocks: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canSetLock: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canGetAvailableLocks: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canAddChild: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canRemoveChild: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canGetChildren: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
    canSetProperty: (arg: MethodCallArgs, resource: IResource, callback: any) => void;
    canGetProperty: (arg: MethodCallArgs, resource: IResource, callback: any) => any;
}
