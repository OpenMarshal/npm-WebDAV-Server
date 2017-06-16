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
import * as https from 'https'

export interface IAutoSave
{
    treeFilePath : string,
    tempTreeFilePath : string,
    onSaveError ?: (error : Error) => void,
    streamProvider ?: (inputStream : Writable, callback : (outputStream ?: Writable) => void) => void
}

export class WebDAVServerOptions
{
    requireAuthentification ?: boolean = false
    httpAuthentication ?: HTTPAuthentication = new HTTPDigestAuthentication('default realm')
    privilegeManager ?: IPrivilegeManager = new FakePrivilegeManager()
    rootResource ?: IResource = new RootResource()
    userManager ?: IUserManager = new SimpleUserManager()
    lockTimeout ?: number = 3600
    strictMode ?: boolean = false
    canChunk ?: boolean = true
    hostname ?: string = '::'
    https ?: https.ServerOptions = null
    port ?: number = 1900
    serverName ?: string = 'webdav-server'
    version ?: string = '1.8.0'
    autoSave ?: IAutoSave = null
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
