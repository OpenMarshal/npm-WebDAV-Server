import { PrivilegeManagerMethod } from './IPrivilegeManager'
import { IPrivilegeManager } from './IPrivilegeManager'
import { RequestContext } from '../../../server/v2/RequestContext'
import { LockType } from '../../../resource/lock/LockType'

export type SimpleBasicPrivilege = 
    'all'
    | 'canCreate'
    | 'canDelete'
    | 'canWrite'
    | 'canSource'
    | 'canRead'
    | 'canListLocks'
    | 'canSetLock'
    | 'canGetAvailableLocks'
    | 'canAddChild'
    | 'canRemoveChild'
    | 'canGetChildren'
    | 'canSetProperty'
    | 'canGetProperty';

export abstract class SimplePrivilegeManager implements IPrivilegeManager
{
    abstract canCreate : PrivilegeManagerMethod
    abstract canDelete : PrivilegeManagerMethod
    canMove = (ctx, resource, callback) => {
        this.canDelete(ctx, resource, (e, v) => {
            if(e || !v)
                callback(e, v);
            else
                this.canRead(ctx, resource, callback);
        })
    }
    canRename = (ctx, resource, callback) => this.canWrite(ctx, resource, callback)
    canAppend = (ctx, resource, callback) => this.canWrite(ctx, resource, callback)
    abstract canWrite : PrivilegeManagerMethod
    abstract canRead : PrivilegeManagerMethod
    abstract canSource : PrivilegeManagerMethod
    canGetMimeType = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
    canGetSize = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
    abstract canListLocks : PrivilegeManagerMethod
    abstract canSetLock : PrivilegeManagerMethod
    canRemoveLock = (ctx, resource, callback) => this.canSetLock(ctx, resource, callback)
    abstract canGetAvailableLocks : PrivilegeManagerMethod
    canGetLock = (ctx, resource, callback) => this.canListLocks(ctx, resource, callback)
    abstract canAddChild : PrivilegeManagerMethod
    abstract canRemoveChild : PrivilegeManagerMethod
    abstract canGetChildren : PrivilegeManagerMethod
    abstract canSetProperty : PrivilegeManagerMethod
    abstract canGetProperty : PrivilegeManagerMethod
    canGetProperties = (ctx, resource, callback) => this.canGetProperty(ctx, resource, callback)
    canRemoveProperty = (ctx, resource, callback) => this.canSetProperty(ctx, resource, callback)
    canGetCreationDate = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
    canGetLastModifiedDate = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
    canGetWebName = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
    canGetType = (ctx, resource, callback) => this.canRead(ctx, resource, callback)
}
