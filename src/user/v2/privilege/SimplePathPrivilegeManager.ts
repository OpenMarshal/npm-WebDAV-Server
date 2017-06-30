import { BasicPrivilege, PrivilegeManager, PrivilegeManagerCallback } from './PrivilegeManager'
import { Resource, Path } from '../../../manager/v2/export'
import { Errors } from '../../../Errors'
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

export class SimplePathPrivilegeManager extends PrivilegeManager
{
    rights : any;

    constructor()
    {
        super();

        this.rights = {};
    }

    setRights(user : IUser, path : string, rights : BasicPrivilege[] | string[])
    {
        if(!user)
            throw Errors.IllegalArguments;
        
        if(!this.rights[user.uid])
            this.rights[user.uid] = {};

        this.rights[user.uid][standarizePath(path)] = rights;
    }
    getRights(user : IUser, path : string) : string[]
    {
        if(!user)
            return [];
        
        const allRights = this.rights[user.uid];
        if(!allRights)
            return [];
            
        path = standarizePath(path.toString());

        const rights = {};
        for(const superPath in allRights)
            if(path.indexOf(superPath) === 0)
                for(const right of allRights[superPath])
                    rights[right] = true;

        return Object.keys(rights);
    }

    _can(fullPath : Path, resource : Resource, privilege : BasicPrivilege | string, callback : PrivilegeManagerCallback) : void
    {
        const user = resource.context.user;
        if(!user)
            return callback(null, false);
        if(user.isAdministrator)
            return callback(null, true);
        
        const rights = this.getRights(user, Path.toString());
        const can = !!rights && rights.some((r) => r === 'all' || r === privilege);
        callback(null, can);
    }
}
