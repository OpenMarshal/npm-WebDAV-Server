import { BasicPrivilege, PrivilegeManager, PrivilegeManagerCallback } from './PrivilegeManager'
import { Resource, Path } from '../../../manager/v2/export'
import { startsWith } from '../../../helper/JSCompatibility'
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
        
        const rs = rights as string[];
        if(rs.indexOf('canRead') !== -1)
        {
            rs.push('canReadLocks');
            rs.push('canReadContent');
            rs.push('canReadProperties');
        }
        if(rs.indexOf('canReadContent') !== -1)
        {
            rs.push('canReadContentTranslated');
            rs.push('canReadContentSource');
        }
        
        if(rs.indexOf('canWrite') !== -1)
        {
            rs.push('canWriteLocks');
            rs.push('canWriteContent');
            rs.push('canWriteProperties');
        }
        if(rs.indexOf('canWriteContent') !== -1)
        {
            rs.push('canWriteContentTranslated');
            rs.push('canWriteContentSource');
        }

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
        {
            if(startsWith(path, superPath))
            {
                for(const right of allRights[superPath])
                    rights[right] = true;
            }
        }

        return Object.keys(rights);
    }

    _can(fullPath : Path, user : IUser, resource : Resource, privilege : BasicPrivilege | string, callback : PrivilegeManagerCallback) : void
    {
        if(!user)
            return callback(null, false);
        
        const rights = this.getRights(user, fullPath.toString());
        const can = !!rights && rights.some((r) => r === 'all' || r === privilege);
        callback(null, can);
    }
}
