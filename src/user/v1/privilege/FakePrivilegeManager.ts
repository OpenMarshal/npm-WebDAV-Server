import { SimplePrivilegeManager } from './SimplePrivilegeManager'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { hasNoWriteLock } from './IPrivilegeManager'
import { IResource } from '../../../resource/v1/IResource'
import { LockType } from '../../../resource/v1/lock/LockType'

export class FakePrivilegeManager extends SimplePrivilegeManager
{
    constructor()
    {
        super();
    }
    
    canCreate = (arg, resource, callback) => callback(null, true)
    canDelete = hasNoWriteLock
    canWrite = hasNoWriteLock
    canSource = (arg, resource, callback) => callback(null, true)
    canRead = (arg, resource, callback) => callback(null, true)
    canListLocks = (arg, resource, callback) => callback(null, true)
    canSetLock = hasNoWriteLock
    canGetAvailableLocks = (arg, resource, callback) => callback(null, true)
    canAddChild = hasNoWriteLock
    canRemoveChild = hasNoWriteLock
    canGetChildren = (arg, resource, callback) => callback(null, true)
    canSetProperty = hasNoWriteLock
    canGetProperty = (arg, resource, callback) => callback(null, true)
}
