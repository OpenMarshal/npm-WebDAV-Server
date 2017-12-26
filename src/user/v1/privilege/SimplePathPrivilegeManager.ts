import { SimplePrivilegeManager, SimpleBasicPrivilege } from './SimplePrivilegeManager'
import { MethodCallArgs } from '../../../server/v1/MethodCallArgs'
import { hasNoWriteLock } from './IPrivilegeManager'
import { IResource } from '../../../resource/v1/IResource'
import { LockType } from '../../../resource/v1/lock/LockType'
import { IUser } from '../IUser'

function standarizePath(path : string)
{
    if(!path)
        path = '/';

    const startIndex = path.indexOf('://');
    if(startIndex !== -1)
    {
        path = path.substr(startIndex + 3);
        path = path.substr(path.indexOf('/') + 1);
    }

    path = path.replace(/\\/g, '/');
    const rex = /\/\//g;
    while(rex.test(path))
        path = path.replace(rex, '/');
    path = path.replace(/\/$/g, '');
    path = path.replace(/^([^\/])/g, '/$1');
    if(path.length === 0)
        path = '/';
    
    return path;
}

function checker(sppm : SimplePathPrivilegeManager, right : SimpleBasicPrivilege)
{
    return (arg : MethodCallArgs, resource : IResource, callback) => callback(null, sppm.can(arg.user, arg.uri, right));
}
function checkerNoLock(sppm : SimplePathPrivilegeManager, right : SimpleBasicPrivilege)
{
    return (arg : MethodCallArgs, resource : IResource, callback) => {
        if(!sppm.can(arg.user, arg.uri, right))
            callback(null, false);
        else
            hasNoWriteLock(arg, resource, callback);
    };
}

export class SimplePathPrivilegeManager extends SimplePrivilegeManager
{
    rights : any;

    constructor()
    {
        super();

        this.rights = {};
    }

    setRights(user : IUser, path : string, rights : SimpleBasicPrivilege[])
    {
        if(!this.rights[user.uid])
            this.rights[user.uid] = {};

        this.rights[user.uid][standarizePath(path)] = rights;
    }
    getRights(user : IUser, path : string) : SimpleBasicPrivilege[]
    {
        if(!this.rights[user.uid])
            return [];

        return this.rights[user.uid][standarizePath(path)];
    }
    can(user : IUser, path : string, right : SimpleBasicPrivilege) : boolean
    {
        const rights = this.getRights(user, path);
        const r = rights && (rights.indexOf('all') !== -1 || rights.indexOf(right) !== -1);
        return r;
    }
    
    canCreate = checker(this, 'canCreate')
    canDelete = checkerNoLock(this, 'canDelete')
    canWrite = checkerNoLock(this, 'canWrite')
    canSource = checker(this, 'canSource')
    canRead = checker(this, 'canRead')
    canListLocks = checker(this, 'canListLocks')
    canSetLock = checkerNoLock(this, 'canSetLock')
    canGetAvailableLocks = checker(this, 'canGetAvailableLocks')
    canAddChild = checkerNoLock(this, 'canAddChild')
    canRemoveChild = checkerNoLock(this, 'canRemoveChild')
    canGetChildren = checker(this, 'canGetChildren')
    canSetProperty = checkerNoLock(this, 'canSetProperty')
    canGetProperty = checker(this, 'canGetProperty')
}
