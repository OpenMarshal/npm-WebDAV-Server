import { BasicPrivilege, PrivilegeManager, PrivilegeManagerCallback } from './PrivilegeManager'
import { RequestContext } from '../../../server/v2/RequestContext'
import { Resource, Path } from '../../../manager/v2/export'
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
        if(!this.rights[user.uid])
            this.rights[user.uid] = {};

        this.rights[user.uid][standarizePath(path)] = rights;
    }
    getRights(user : IUser, path : string) : string[]
    {
        if(!this.rights[user.uid])
            return [];

        return this.rights[user.uid][standarizePath(path)];
    }

    _can(fuullPath : Path, resource : Resource, privilege : BasicPrivilege | string, callback : PrivilegeManagerCallback) : void
    {
        const rights = this.getRights(resource.context.user, Path.toString());
        callback(null, rights && (rights.indexOf('all') !== -1 || rights.some((r) => r === 'all' || r === privilege)));
    }
}
