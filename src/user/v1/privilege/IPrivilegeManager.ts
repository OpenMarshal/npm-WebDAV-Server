import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { IResource } from '../../../resource/v1/IResource'
import { LockType } from '../../../resource/v1/lock/LockType'

export type PrivilegeManagerCallback = (error : Error, hasAccess : boolean) => void;
export type PrivilegeManagerMethod = (arg : MethodCallArgs, resource : IResource, callback : PrivilegeManagerCallback) => void

export type BasicPrivilege = 
    'all'
    | 'canCreate'
    | 'canDelete'
    | 'canMove'
    | 'canRename'
    | 'canAppend'
    | 'canWrite'
    | 'canRead'
    | 'canSource'
    | 'canGetMimeType'
    | 'canGetSize'
    | 'canListLocks'
    | 'canSetLock'
    | 'canRemoveLock'
    | 'canGetAvailableLocks'
    | 'canGetLock'
    | 'canAddChild'
    | 'canRemoveChild'
    | 'canGetChildren'
    | 'canSetProperty'
    | 'canGetProperty'
    | 'canGetProperties'
    | 'canRemoveProperty'
    | 'canGetCreationDate'
    | 'canGetLastModifiedDate'
    | 'canGetWebName'
    | 'canGetType';

export function requirePrivilege(privilege : string | BasicPrivilege | string[] | BasicPrivilege[], arg : MethodCallArgs, resource : IResource, callback : PrivilegeManagerCallback)
{
    const privileges : string[] = privilege.constructor !== Array ? [ privilege as string ] : privilege as string[];
    const pm = arg.server.privilegeManager;

    go();
    function go(error : Error = null, hasAccess : boolean = true)
    {
        if(privileges.length === 0 || error || !hasAccess)
        {
            process.nextTick(() => callback(error, hasAccess));
            return;
        }

        process.nextTick(() => pm[privileges.shift()](arg, resource, go));
    }
}

export interface IPrivilegeManager
{
    canCreate : PrivilegeManagerMethod
    canDelete : PrivilegeManagerMethod
    canMove : PrivilegeManagerMethod
    canRename : PrivilegeManagerMethod
    canAppend : PrivilegeManagerMethod
    canWrite : PrivilegeManagerMethod
    canRead : PrivilegeManagerMethod
    canSource : PrivilegeManagerMethod
    canGetMimeType : PrivilegeManagerMethod
    canGetSize : PrivilegeManagerMethod
    canListLocks : PrivilegeManagerMethod
    canSetLock : PrivilegeManagerMethod
    canRemoveLock : PrivilegeManagerMethod
    canGetAvailableLocks : PrivilegeManagerMethod
    canGetLock : PrivilegeManagerMethod
    canAddChild : PrivilegeManagerMethod
    canRemoveChild : PrivilegeManagerMethod
    canGetChildren : PrivilegeManagerMethod
    canSetProperty : PrivilegeManagerMethod
    canGetProperty : PrivilegeManagerMethod
    canGetProperties : PrivilegeManagerMethod
    canRemoveProperty : PrivilegeManagerMethod
    canGetCreationDate : PrivilegeManagerMethod
    canGetLastModifiedDate : PrivilegeManagerMethod
    canGetWebName : PrivilegeManagerMethod
    canGetType : PrivilegeManagerMethod
}

export function hasNoWriteLock(arg : MethodCallArgs, resource : IResource, callback : PrivilegeManagerCallback)
{
    resource.getLocks((e, locks) => {
        const hasNoLock = locks ? locks.filter((l) => (!l.userUid || l.userUid !== arg.user.uid) && l.lockKind.type.isSame(LockType.Write)).length === 0 : false;
        if(!hasNoLock || !resource.parent)
            callback(e, hasNoLock);
        else
            hasNoWriteLock(arg, resource.parent, callback);
    });
}
