import { WebDAVServerOptions, setDefaultServerOptions } from '../WebDAVServerOptions'
import { RequestContext, RequestContextExternalOptions } from '../RequestContext'
import { HTTPCodes, HTTPMethod } from '../WebDAVRequest'
import { HTTPAuthentication } from '../../../user/v2/authentication/HTTPAuthentication'
import { PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager'
import { FileSystem } from '../../../manager/v2/fileSystem/FileSystem'
import { ReturnCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { Readable } from 'stream'
import Commands from '../commands/Commands'
import { Path } from '../../../manager/v2/Path'

import * as persistence from './Persistence'
import * as beforeAfter from './BeforeAfter'
import * as startStop from './StartStop'
import * as https from 'https'
import * as http from 'http'

export type WebDAVServerStartCallback = (server ?: http.Server) => void;

/**
 * @deprecated This is a class of the versoin 1 of webdav-server, prefer using the version 2. This class and all v1 classes will be removed in a future release.
 */
export class WebDAVServer
{
    public httpAuthentication : HTTPAuthentication
    public privilegeManager : PrivilegeManager
    public options : WebDAVServerOptions
    public methods : { [methodName : string]: HTTPMethod }

    protected beforeManagers : beforeAfter.RequestListener[]
    protected afterManagers : beforeAfter.RequestListener[]
    protected unknownMethod : HTTPMethod
    protected server : http.Server | https.Server
    
    protected fileSystems : {
        [path : string] : FileSystem
    }

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = setDefaultServerOptions(options);

        this.httpAuthentication = this.options.httpAuthentication;
        this.privilegeManager = this.options.privilegeManager;
        this.fileSystems = {
            '/': this.options.rootFileSystem
        };

        // Implement all methods in commands/Commands.ts
        const commands : { [name : string] : any } = Commands;
        for(const k in commands)
            if(k === 'NotImplemented')
                this.onUnknownMethod(new commands[k]());
            else
                this.method(k, new commands[k]());
    }

    createExternalContext() : RequestContext
    createExternalContext(callback : (error : Error, ctx : RequestContext) => void) : RequestContext
    createExternalContext(options : RequestContextExternalOptions) : RequestContext
    createExternalContext(options : RequestContextExternalOptions, callback : (error : Error, ctx : RequestContext) => void) : RequestContext
    createExternalContext(_options ?: RequestContextExternalOptions | ((error : Error, ctx : RequestContext) => void), _callback ?: (error : Error, ctx : RequestContext) => void) : RequestContext
    {
        return RequestContext.createExternal(this, _options, _callback);
    }

    rootFileSystem() : FileSystem
    {
        return this.fileSystems['/'];
    }

    getResource(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Resource>) : void
    {
        path = new Path(path);

        this.getFileSystem(path, (fs, _, subPath) => {
            callback(null, fs.resource(ctx, subPath));
        })
    }

    setFileSystem(path : Path | string, fs : FileSystem, callback : (successed ?: boolean) => void) : void
    setFileSystem(path : Path | string, fs : FileSystem, override : boolean, callback : (successed ?: boolean) => void) : void
    setFileSystem(path : Path | string, fs : FileSystem, _override : boolean | ((successed ?: boolean) => void), _callback ?: (successed ?: boolean) => void) : void
    {
        const override = _callback ? _override as boolean : undefined;
        const callback = _callback ? _callback : _override as ((successed ?: boolean) => void);

        const result = this.setFileSystemSync(path, fs, override);
        if(callback)
            callback(result);
    }
    setFileSystemSync(path : Path | string, fs : FileSystem, override : boolean = true) : boolean
    {
        const sPath = new Path(path).toString();

        if(!override && this.fileSystems[sPath])
            return false;
        
        this.fileSystems[sPath] = fs;
        return true;
    }
    
    removeFileSystem(path : Path | string, callback : (nbRemoved ?: number) => void) : void
    removeFileSystem(fs : FileSystem, callback : (nbRemoved ?: number) => void) : void
    removeFileSystem(fs : FileSystem, checkByReference : boolean, callback : (nbRemoved ?: number) => void) : void
    removeFileSystem(fs_path : Path | string | FileSystem, _checkByReference : boolean | ((nbRemoved ?: number) => void), _callback ?: (nbRemoved ?: number) => void) : void
    {
        const checkByReference = _callback ? _checkByReference as boolean : false;
        const callback = _callback ? _callback : _checkByReference as ((nbRemoved ?: number) => void);

        const result = this.removeFileSystemSync(fs_path as any, checkByReference);
        if(callback)
            callback(result);
    }

    removeFileSystemSync(path : Path | string) : number
    removeFileSystemSync(fs : FileSystem, checkByReference ?: boolean) : number
    removeFileSystemSync(fs_path : Path | string | FileSystem, checkByReference : boolean = false) : number
    {
        if(fs_path.constructor === Path || fs_path.constructor === String)
        {
            const path = new Path(fs_path as (Path | string)).toString();
            if(this.fileSystems[path] === undefined)
                return 0;
            else
            {
                delete this.fileSystems[path];
                return 1;
            }
        }
        else
        {
            const fs = fs_path as FileSystem;
            let nb = 0;

            for(const name in this.fileSystems)
                if(checkByReference && this.fileSystems[name] === fs || !checkByReference && this.fileSystems[name].serializer().uid() === fs.serializer().uid())
                {
                    ++nb;
                    delete this.fileSystems[name];
                }
            return nb;
        }
    }

    getFileSystemPath(fs : FileSystem, callback : (path : Path) => void) : void
    getFileSystemPath(fs : FileSystem, checkByReference : boolean, callback : (path : Path) => void) : void
    getFileSystemPath(fs : FileSystem, _checkByReference : boolean | ((path : Path) => void), _callback ?: (path : Path) => void) : void
    {
        const checkByReference = _callback ? _checkByReference as boolean : undefined;
        const callback = _callback ? _callback : _checkByReference as ((path : Path) => void);

        callback(this.getFileSystemPathSync(fs, checkByReference));
    }
    getFileSystemPathSync(fs : FileSystem, checkByReference ?: boolean) : Path
    {
        checkByReference = checkByReference === null || checkByReference === undefined ? true : checkByReference;

        for(const path in this.fileSystems)
            if(checkByReference && this.fileSystems[path] === fs || !checkByReference && this.fileSystems[path].serializer().uid() === fs.serializer().uid())
                return new Path(path);
        return null;
    }

    getChildFileSystems(parentPath : Path, callback : (fss : { fs : FileSystem, path : Path }[]) => void) : void
    {
        const result = this.getChildFileSystemsSync(parentPath);
        callback(result);
    }
    getChildFileSystemsSync(parentPath : Path) : { fs : FileSystem, path : Path }[]
    {
        const results : { fs : FileSystem, path : Path }[] = [];
        const seekPath = parentPath.toString(true);

        for(const fsPath in this.fileSystems)
        {
            const pfsPath = new Path(fsPath);
            if(pfsPath.paths.length === parentPath.paths.length + 1 && fsPath.indexOf(seekPath) === 0)
                results.push({
                    fs: this.fileSystems[fsPath],
                    path: pfsPath
                });
        }

        return results;
    }

    getFileSystem(path : Path, callback : (fs : FileSystem, rootPath : Path, subPath : Path) => void) : void
    {
        const result = this.getFileSystemSync(path);
        callback(result.fs, result.rootPath, result.subPath);
    }
    getFileSystemSync(path : Path) : { fs : FileSystem, rootPath : Path, subPath : Path }
    {
        let best : any = {
            index: 0,
            rootPath : new Path('/')
        };

        for(const fsPath in this.fileSystems)
        {
            const pfsPath = new Path(fsPath);

            if(path.paths.length < pfsPath.paths.length)
                continue;

            let value = 0;
            for(; value < pfsPath.paths.length; ++value)
                if(pfsPath.paths[value] !== path.paths[value])
                {
                    value = -1;
                    break;
                }
            
            if(best.index < value)
                best = {
                    index: value,
                    rootPath: pfsPath
                }

            if(value === path.paths.length)
                break; // Found the best value possible.
        }

        const subPath = path.clone();
        for(const _ of best.rootPath.paths)
            subPath.removeRoot();
        
        return {
            fs: this.fileSystems[best.rootPath.toString()],
            rootPath: best.rootPath,
            subPath
        };
    }





    onUnknownMethod(unknownMethod : HTTPMethod)
    {
        this.unknownMethod = unknownMethod;
    }

    // Start / Stop
    start(port : number)
    start(callback : WebDAVServerStartCallback)
    start(port : number, callback : WebDAVServerStartCallback)
    start(port ?: number | WebDAVServerStartCallback, callback ?: WebDAVServerStartCallback)
    {
        startStop.start.bind(this)(port, callback);
    }
    stop = startStop.stop

    // Persistence
    autoLoad = persistence.autoLoad
    load = persistence.load
    save = persistence.save

    method(name : string, manager : HTTPMethod)
    {
        this.methods[this.normalizeMethodName(name)] = manager;
    }

    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    // Before / After execution
    invokeBeforeRequest(base : RequestContext, callback)
    {
        beforeAfter.invokeBeforeRequest.bind(this)(base, callback);
    }
    invokeAfterRequest(base : RequestContext, callback)
    {
        beforeAfter.invokeAfterRequest.bind(this)(base, callback);
    }
    beforeRequest(manager : beforeAfter.RequestListener)
    {
        this.beforeManagers.push(manager);
    }
    afterRequest(manager : beforeAfter.RequestListener)
    {
        this.afterManagers.push(manager);
    }
}
