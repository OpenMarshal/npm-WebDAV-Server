import { IStorageManager, NoStorageManager } from '../../manager/v2/fileSystem/StorageManager'
import { HTTPDigestAuthentication } from '../../user/v2/authentication/HTTPDigestAuthentication'
import { FileSystemSerializer } from '../../manager/v2/fileSystem/Serialization'
import { HTTPAuthentication } from '../../user/v2/authentication/HTTPAuthentication'
import { Writable, Readable } from 'stream'
import { VirtualFileSystem } from '../../manager/v2/instances/VirtualFileSystem'
import { SimpleUserManager } from '../../user/v2/simple/SimpleUserManager'
import { PrivilegeManager } from '../../user/v2/privilege/PrivilegeManager'
import { getPackageData } from '../../helper/v2/npmPackage'
import { FileSystem } from '../../manager/v2/fileSystem/FileSystem'
import * as https from 'https'

export interface IAutoSave
{
    treeFilePath : string,
    tempTreeFilePath ?: string,
    onSaveError ?: (error : Error) => void,
    streamProvider ?: (callback : (inputStream ?: Writable, outputStream ?: Writable) => void) => void
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
    version ?: string = undefined
    autoSave ?: IAutoSave = null
    autoLoad ?: IAutoLoad = null
    storageManager ?: IStorageManager = new NoStorageManager()
    enableLocationTag ?: boolean = false
    maxRequestDepth ?: number = 1
    respondWithPaths ?: boolean = false
    headers ?: { [name : string] : string | string[] }
}
export default WebDAVServerOptions;

export function setDefaultServerOptions(options : WebDAVServerOptions) : WebDAVServerOptions
{
    const defaultOptions = new WebDAVServerOptions();

    if(!options)
        options = {};
    
    for(const name in defaultOptions)
    {
        if(options[name] === undefined)
            options[name] = defaultOptions[name];
    }

    if(!options.version)
    {
        getPackageData((e, pkg) => {
            if(pkg && !options.version && pkg.version)
                options.version = pkg.version;
        })
    }
    
    return options;
}
