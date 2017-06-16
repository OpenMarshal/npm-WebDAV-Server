import { HTTPBasicAuthentication } from '../user/authentication/HTTPBasicAuthentication'
import { HTTPDigestAuthentication } from '../user/authentication/HTTPDigestAuthentication'
import { FakePrivilegeManager } from '../user/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication'
import { Writable, Readable } from 'stream'
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../user/simple/SimpleUserManager'
import { RootResource } from '../resource/std/RootResource'
import { IUserManager } from '../user/IUserManager'
import { IResource } from '../resource/IResource'
import { FSManager } from '../manager/FSManager'
import * as https from 'https'

export interface IAutoSave
{
    treeFilePath : string,
    tempTreeFilePath : string,
    onSaveError ?: (error : Error) => void,
    streamProvider ?: (inputStream : Writable, callback : (outputStream ?: Writable) => void) => void
}

export interface IAutoLoad
{
    treeFilePath : string,
    fsManagers : FSManager[],
    streamProvider ?: (inputStream : Readable, callback : (outputStream ?: Readable) => void) => void
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
    autoLoad ?: IAutoLoad = null
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
