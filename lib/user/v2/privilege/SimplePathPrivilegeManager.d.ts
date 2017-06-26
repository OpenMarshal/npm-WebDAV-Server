import { SimplePrivilegeManager, SimpleBasicPrivilege } from './SimplePrivilegeManager';
import { RequestContext } from '../../../server/v2/RequestContext';
import { Resource } from '../../../manager/v2/export';
import { IUser } from '../IUser';
export declare class SimplePathPrivilegeManager extends SimplePrivilegeManager {
    rights: any;
    constructor();
    setRights(user: IUser, path: string, rights: SimpleBasicPrivilege[]): void;
    getRights(user: IUser, path: string): SimpleBasicPrivilege[];
    can(user: IUser, path: string, right: SimpleBasicPrivilege): boolean;
    canCreate: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canDelete: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canWrite: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canSource: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canRead: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canListLocks: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canSetLock: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canGetAvailableLocks: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canAddChild: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canRemoveChild: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canGetChildren: (ctx: RequestContext, resource: Resource, callback: any) => any;
    canSetProperty: (ctx: RequestContext, resource: Resource, callback: any) => void;
    canGetProperty: (ctx: RequestContext, resource: Resource, callback: any) => any;
}
