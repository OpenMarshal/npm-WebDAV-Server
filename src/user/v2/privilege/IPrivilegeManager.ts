import { RequestContext } from '../../../server/v2/RequestContext'
import { Resource } from '../../../manager/v2/export'
import { LockType } from '../../../resource/lock/LockType'

export type PrivilegeManagerCallback = (error : Error, hasAccess : boolean) => void;
export type PrivilegeManagerMethod = (ctx : RequestContext, resource : Resource, callback : PrivilegeManagerCallback) => void

export type BasicPrivilege = 
    'all'
    | 'canReadLocks'
    | 'canWriteLocks'
    | 'canWrite'
    | 'canRead'
    | 'canSee'
    | 'canReadProperties'
    | 'canWriteProperties'
/*
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
*/
export function requirePrivilege(privilege : string | BasicPrivilege | string[] | BasicPrivilege[], ctx : RequestContext, resource : Resource, callback : PrivilegeManagerCallback)
{/*
    const privileges : string[] = privilege.constructor !== Array ? [ privilege as string ] : privilege as string[];
    const pm = ctx.server.privilegeManager;

    go();
    function go(error : Error = null, hasAccess : boolean = true)
    {
        if(privileges.length === 0 || error || !hasAccess)
        {
            process.nextTick(() => callback(error, hasAccess));
            return;
        }

        process.nextTick(() => pm[privileges.shift()](ctx, resource, go));
    }*/
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

export function hasNoWriteLock(ctx : RequestContext, resource : Resource, callback : PrivilegeManagerCallback)
{/*
    resource.getLocks((e, locks) => {
        const hasNoLock = locks ? locks.filter((l) => (!l.userUid || l.userUid !== ctx.user.uid) && l.lockKind.type.isSame(LockType.Write)).length === 0 : false;
        if(!hasNoLock || !resource.parent)
            callback(e, hasNoLock);
        else
            hasNoWriteLock(ctx, resource.parent, callback);
    });*/
}
