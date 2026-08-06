import { BasicPrivilege, PrivilegeManager, PrivilegeManagerCallback } from './PrivilegeManager'
import { Resource, Path } from '../../../manager/v2/export'
import { startsWith } from '../../../helper/JSCompatibility'
import { Errors } from '../../../Errors'
import { IUser } from '../IUser'
import { normalizePath } from '../../CommonFunctions'

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
        if(!this.userValidator.isUserValid(user))
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

        this.rights[user.uid][normalizePath(path)] = rights;
    }
    getRights(user : IUser, path : string) : string[]
    {
        if(!this.userValidator.isUserValid(user))
            throw Errors.IllegalArguments;
        
        const allRights = this.rights[user.uid];
        if(!allRights)
        { // user is unknown by the current PrivilegeManager
            return [];
        }
            
        path = normalizePath(path.toString());

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
        const rights = this.getRights(user, fullPath.toString());
        const can = !!rights && rights.some((r) => r === 'all' || r === privilege);
        callback(null, can);
    }
}
