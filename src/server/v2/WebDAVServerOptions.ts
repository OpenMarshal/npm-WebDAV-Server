import { HTTPBasicAuthentication } from '../../user/v2/authentication/HTTPBasicAuthentication'
import { HTTPDigestAuthentication } from '../../user/v2/authentication/HTTPDigestAuthentication'
import { HTTPAuthentication } from '../../user/v2/authentication/HTTPAuthentication'
import { Writable, Readable } from 'stream'
import { PrivilegeManager } from '../../user/v2/privilege/PrivilegeManager'
import { SimpleUserManager } from '../../user/v2/simple/SimpleUserManager'
import { RootResource } from '../../resource/std/RootResource'
import { IUserManager } from '../../user/v2/IUserManager'
import { VirtualFileSystem } from '../../manager/v2/instances/VirtualFileSystem'
import { FileSystem } from '../../manager/v2/fileSystem/FileSystem'
import { FileSystemSerializer } from '../../manager/v2/fileSystem/Serialization'
import * as https from 'https'

export interface IAutoSave
{
    treeFilePath : string,
    tempTreeFilePath ?: string,
    onSaveError ?: (error : Error) => void,
    streamProvider ?: (inputStream : Writable, callback : (outputStream ?: Writable) => void) => void
}

export interface IAutoLoad
{
    treeFilePath ?: string,
    serializers ?: FileSystemSerializer[],
    streamProvider ?: (inputStream : Readable, callback : (outputStream ?: Readable) => void) => void
}

export class WebDAVServerOptions
{
    requireAuthentification ?: boolean = false
    httpAuthentication ?: HTTPAuthentication = new HTTPDigestAuthentication(new SimpleUserManager(), 'default realm')
    privilegeManager ?: PrivilegeManager = new PrivilegeManager()
    rootFileSystem ?: FileSystem = new VirtualFileSystem()
    lockTimeout ?: number = 3600
    strictMode ?: boolean = false
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
