import { PrivilegeManagerMethod } from './IPrivilegeManager'
import { IPrivilegeManager } from './IPrivilegeManager'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { IResource } from '../../../resource/v1/IResource'
import { LockType } from '../../../resource/v1/lock/LockType'

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
    canMove = (arg, resource, callback) => {
        this.canDelete(arg, resource, (e, v) => {
            if(e || !v)
                callback(e, v);
            else
                this.canRead(arg, resource, callback);
        })
    }
    canRename = (arg, resource, callback) => this.canWrite(arg, resource, callback)
    canAppend = (arg, resource, callback) => this.canWrite(arg, resource, callback)
    abstract canWrite : PrivilegeManagerMethod
    abstract canRead : PrivilegeManagerMethod
    abstract canSource : PrivilegeManagerMethod
    canGetMimeType = (arg, resource, callback) => this.canRead(arg, resource, callback)
    canGetSize = (arg, resource, callback) => this.canRead(arg, resource, callback)
    abstract canListLocks : PrivilegeManagerMethod
    abstract canSetLock : PrivilegeManagerMethod
    canRemoveLock = (arg, resource, callback) => this.canSetLock(arg, resource, callback)
    abstract canGetAvailableLocks : PrivilegeManagerMethod
    canGetLock = (arg, resource, callback) => this.canListLocks(arg, resource, callback)
    abstract canAddChild : PrivilegeManagerMethod
    abstract canRemoveChild : PrivilegeManagerMethod
    abstract canGetChildren : PrivilegeManagerMethod
    abstract canSetProperty : PrivilegeManagerMethod
    abstract canGetProperty : PrivilegeManagerMethod
    canGetProperties = (arg, resource, callback) => this.canGetProperty(arg, resource, callback)
    canRemoveProperty = (arg, resource, callback) => this.canSetProperty(arg, resource, callback)
    canGetCreationDate = (arg, resource, callback) => this.canRead(arg, resource, callback)
    canGetLastModifiedDate = (arg, resource, callback) => this.canRead(arg, resource, callback)
    canGetWebName = (arg, resource, callback) => this.canRead(arg, resource, callback)
    canGetType = (arg, resource, callback) => this.canRead(arg, resource, callback)
}
