import { HTTPBasicAuthentication } from '../user/authentication/HTTPBasicAuthentication'
import { FakePrivilegeManager } from '../user/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../user/simple/SimpleUserManager'
import { RootResource } from '../resource/std/RootResource'
import { IUserManager } from '../user/IUserManager'
import { IResource } from '../resource/IResource'

export class WebDAVServerOptions
{
    requireAuthentification ?: boolean = false
    httpAuthentication ?: HTTPAuthentication = new HTTPBasicAuthentication('default realm')
    privilegeManager ?: IPrivilegeManager = new FakePrivilegeManager()
    rootResource ?: IResource = new RootResource()
    userManager ?: IUserManager = new SimpleUserManager()
    lockTimeout ?: number = 3600
    hostname ?: string = '::'
    port ?: number = 1900
}
export default WebDAVServerOptions;

export function setDefaultServerOptions(options : WebDAVServerOptions) : WebDAVServerOptions
{
    const def = new WebDAVServerOptions();

    if(!options)
        return def;

    for(const name in def)
        if(options[name] === undefined)
            options[name] = def[name];
    
    return options;
}
