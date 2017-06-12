import { HTTPBasicAuthentication } from '../user/authentication/HTTPBasicAuthentication'
import { HTTPDigestAuthentication } from '../user/authentication/HTTPDigestAuthentication'
import { FakePrivilegeManager } from '../user/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../user/simple/SimpleUserManager'
import { RootResource } from '../resource/std/RootResource'
import { IUserManager } from '../user/IUserManager'
import { IResource } from '../resource/IResource'
import { Writable } from 'stream'

export class WebDAVServerOptions
{
    requireAuthentification ?: boolean = false
    httpAuthentication ?: HTTPAuthentication = new HTTPDigestAuthentication('default realm')
    privilegeManager ?: IPrivilegeManager = new FakePrivilegeManager()
    rootResource ?: IResource = new RootResource()
    userManager ?: IUserManager = new SimpleUserManager()
    lockTimeout ?: number = 3600
    canChunk ?: boolean = true
    hostname ?: string = '::'
    port ?: number = 1900
    strictMode ?: boolean = false
    autoSave ?: {
        treeFilePath : string
        tempTreeFilePath : string
        onSaveError ?: (error : Error) => void
        streamProvider ?: (stream : Writable, callback : () => void) => void
    } = null
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
