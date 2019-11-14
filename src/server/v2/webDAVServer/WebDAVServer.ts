import { ExternalRequestContext, RequestContextExternalOptions, RequestContext } from '../RequestContext'
import { WebDAVServerOptions, setDefaultServerOptions, IAutoSave } from '../WebDAVServerOptions'
import { HTTPAuthentication } from '../../../user/v2/authentication/HTTPAuthentication'
import { PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager'
import { ReturnCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { FileSystem } from '../../../manager/v2/fileSystem/FileSystem'
import { startsWith } from '../../../helper/JSCompatibility'
import { HTTPMethod } from '../WebDAVRequest'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { Path } from '../../../manager/v2/Path'

import Commands from '../commands/Commands'

import * as persistence from './Persistence'
import * as beforeAfter from './BeforeAfter'
import * as startStop from './StartStop'
import * as https from 'https'
import * as http from 'http'
import { promisifyCall } from '../../../helper/v2/promise'
import { SerializedData, FileSystemSerializer } from '../../../manager/v2/export'

export type WebDAVServerStartCallback = (server ?: http.Server) => void;

export type FileSystemEvent = 'create' | 'delete' | 'openReadStream' | 'openWriteStream' | 'move' | 'copy' | 'rename' |
                              'before-create' | 'before-delete' | 'before-openReadStream' | 'before-openWriteStream' | 'before-move' | 'before-copy' | 'before-rename';
export type ServerEvent = FileSystemEvent;
export type EventCallback = (ctx : RequestContext, fs : FileSystem, path : Path, data ?: any) => void;

export class WebDAVServer
{
    public httpAuthentication : HTTPAuthentication
    public privilegeManager : PrivilegeManager
    public options : WebDAVServerOptions
    public methods : { [methodName : string]: HTTPMethod }
    public events : { [event : string] : EventCallback[] }

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
        this.events = {};

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
    
    protected isSameFileSystem(fs : FileSystem, path : string, checkByReference : boolean) : boolean
    {
        return checkByReference && this.fileSystems[path] === fs || !checkByReference && this.fileSystems[path].serializer().uid() === fs.serializer().uid();
    }

    /**
     * Synchronously create an external context with full rights.
     * 
     * @returns The created context.
     */
    createExternalContext() : ExternalRequestContext
    /**
     * Create an external context with full rights.
     * 
     * @param callback Callback containing the created context.
     * @returns The created context.
     */
    createExternalContext(callback : (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    /**
     * Create an external context with specified options.
     * 
     * @param options Options of the context
     * @returns The created context.
     */
    createExternalContext(options : RequestContextExternalOptions) : ExternalRequestContext
    /**
     * Create an external context with specified options.
     * 
     * @param options Options of the context
     * @param callback Callback containing the created context.
     * @returns The created context.
     */
    createExternalContext(options : RequestContextExternalOptions, callback : (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    createExternalContext(_options ?: RequestContextExternalOptions | ((error : Error, ctx : ExternalRequestContext) => void), _callback ?: (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    {
        return ExternalRequestContext.create(this, _options as any, _callback);
    }

    /**
     * Get the root file system.
     * 
     * @returns The root file system
     */
    rootFileSystem() : FileSystem
    {
        return this.fileSystems['/'];
    }

    /**
     * Get a resource object to manage a resource from its path.
     * 
     * @param ctx Context of the request
     * @param path Path of the resource
     */
    getResourceAsync(ctx : RequestContext, path : Path | string) : Promise<Resource>
    {
        return promisifyCall((cb) => this.getResource(ctx, path, cb));
    }

    /**
     * Get a resource object to manage a resource from its path.
     * 
     * @param ctx Context of the request
     * @param path Path of the resource
     * @param callback Callback containing the requested resource
     */
    getResource(ctx : RequestContext, path : Path | string, callback : ReturnCallback<Resource>) : void
    {
        path = new Path(path);

        this.getFileSystem(path, (fs, _, subPath) => {
            callback(null, fs.resource(ctx, subPath));
        })
    }

    /**
     * Synchronously get a resource object to manage a resource from its path.
     * 
     * @param ctx Context of the request
     * @param path Path of the resource
     * @returns The requested resource
     */
    getResourceSync(ctx : RequestContext, path : Path | string) : Resource
    {
        path = new Path(path);

        const info = this.getFileSystemSync(path);
        return info.fs.resource(ctx, info.subPath);
    }
    
    /**
     * Map/mount a file system to a path.
     * 
     * @param path Path where to mount the file system
     * @param fs File system to mount
     */
    setFileSystemAsync(path : Path | string, fs : FileSystem) : Promise<boolean>
    /**
     * Map/mount a file system to a path.
     * 
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     */
    setFileSystemAsync(path : Path | string, fs : FileSystem, override : boolean) : Promise<boolean>
    setFileSystemAsync(path : Path | string, fs : FileSystem, override ?: boolean) : Promise<boolean>
    {
        return promisifyCall((cb) => this.setFileSystem(path, fs, override, (successed) => cb(undefined, successed)));
    }

    /**
     * Map/mount a file system to a path.
     * 
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param callback Callback containing the status of the mounting
     */
    setFileSystem(path : Path | string, fs : FileSystem, callback : (successed ?: boolean) => void) : void
    /**
     * Map/mount a file system to a path.
     * 
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     * @param callback Callback containing the status of the mounting
     */
    setFileSystem(path : Path | string, fs : FileSystem, override : boolean, callback : (successed ?: boolean) => void) : void
    setFileSystem(path : Path | string, fs : FileSystem, _override : boolean | ((successed ?: boolean) => void), _callback ?: (successed ?: boolean) => void) : void
    {
        const override = _callback ? _override as boolean : undefined;
        const callback = _callback ? _callback : _override as ((successed ?: boolean) => void);

        const result = this.setFileSystemSync(path, fs, override);
        if(callback)
            callback(result);
    }

    /**
     * Synchronously map/mount a file system to a path.
     * 
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     * @returns The status of the mounting
     */
    setFileSystemSync(path : Path | string, fs : FileSystem, override : boolean = true) : boolean
    {
        const sPath = new Path(path).toString();

        if(!override && this.fileSystems[sPath])
            return false;
        
        this.fileSystems[sPath] = fs;
        return true;
    }
    
    /**
     * Remove a file system based on its path.
     * 
     * @param path Path of the file system to remove
     * @param callback Callback containing the number of removed file systems (0 or 1)
     */
    removeFileSystem(path : Path | string, callback : (nbRemoved ?: number) => void) : void
    /**
     * Remove a file system.
     * 
     * @param fs File system to remove
     * @param callback Callback containing the number of removed file systems
     */
    removeFileSystem(fs : FileSystem, callback : (nbRemoved ?: number) => void) : void
    /**
     * Remove a file system.
     * 
     * @param fs File system to remove
     * @param checkByReference Define if the file systems must be matched by reference or by its serializer's UID
     * @param callback Callback containing the number of removed file systems
     */
    removeFileSystem(fs : FileSystem, checkByReference : boolean, callback : (nbRemoved ?: number) => void) : void
    removeFileSystem(fs_path : Path | string | FileSystem, _checkByReference : boolean | ((nbRemoved ?: number) => void), _callback ?: (nbRemoved ?: number) => void) : void
    {
        const checkByReference = _callback ? _checkByReference as boolean : true;
        const callback = _callback ? _callback : _checkByReference as ((nbRemoved ?: number) => void);

        const result = this.removeFileSystemSync(fs_path as any, checkByReference);
        if(callback)
            callback(result);
    }
    
    /**
     * Synchronously remove a file system.
     * 
     * @param fs File system to remove
     * @returns The number of removed file systems (0 or 1)
     */
    removeFileSystemSync(path : Path | string) : number
    /**
     * Synchronously remove a file system.
     * 
     * @param fs File system to remove
     * @param checkByReference Define if the file systems must be matched by reference or by its serializer's UID
     * @returns The number of removed file systems
     */
    removeFileSystemSync(fs : FileSystem, checkByReference ?: boolean) : number
    removeFileSystemSync(fs_path : Path | string | FileSystem, checkByReference : boolean = true) : number
    {
        let nb = 0;
        if(fs_path.constructor === Path || fs_path.constructor === String)
        {
            const path = new Path(fs_path as (Path | string)).toString();
            if(this.fileSystems[path] !== undefined)
            {
                delete this.fileSystems[path];
                nb = 1;
            }
        }
        else
        {
            const fs = fs_path as FileSystem;

            for(const name in this.fileSystems)
            {
                if(this.isSameFileSystem(fs, name, checkByReference))
                {
                    delete this.fileSystems[name];
                    ++nb;
                }
            }
        }

        return nb;
    }

    /**
     * Get the mount path of a file system.
     * 
     * @param fs File system
     * @param callback Callback containing the mount path of the file system
     */
    getFileSystemPath(fs : FileSystem, callback : (path : Path) => void) : void
    /**
     * Get the mount path of a file system.
     * 
     * @param fs File system
     * @param checkByReference Define if the file system must be matched by reference or by its serializer's UID
     * @param callback Callback containing the mount path of the file system
     */
    getFileSystemPath(fs : FileSystem, checkByReference : boolean, callback : (path : Path) => void) : void
    getFileSystemPath(fs : FileSystem, _checkByReference : boolean | ((path : Path) => void), _callback ?: (path : Path) => void) : void
    {
        const checkByReference = _callback ? _checkByReference as boolean : undefined;
        const callback = _callback ? _callback : _checkByReference as ((path : Path) => void);

        callback(this.getFileSystemPathSync(fs, checkByReference));
    }
    /**
     * Synchronously get the mount path of a file system.
     * 
     * @param fs File system
     * @param checkByReference Define if the file system must be matched by reference or by its serializer's UID
     * @returns The mount path of the file system
     */
    getFileSystemPathSync(fs : FileSystem, checkByReference ?: boolean) : Path
    {
        checkByReference = checkByReference === null || checkByReference === undefined ? true : checkByReference;

        for(const path in this.fileSystems)
            if(this.isSameFileSystem(fs, path, checkByReference))
                return new Path(path);
        return null;
    }

    /**
     * Get the list of file systems mounted on or under the parentPath.
     * 
     * @param parentPath Path from which list sub file systems
     * @param callback Callback containing the list of file systems found and their mount path
     */
    getChildFileSystems(parentPath : Path, callback : (fss : { fs : FileSystem, path : Path }[]) => void) : void
    {
        const result = this.getChildFileSystemsSync(parentPath);
        callback(result);
    }
    /**
     * Synchronously get the list of file systems mounted on or under the parentPath.
     * 
     * @param parentPath Path from which list sub file systems
     * @returns Object containing the list of file systems found and their mount path
     */
    getChildFileSystemsSync(parentPath : Path) : { fs : FileSystem, path : Path }[]
    {
        const results : { fs : FileSystem, path : Path }[] = [];
        const seekPath = parentPath.toString(true);

        for(const fsPath in this.fileSystems)
        {
            const pfsPath = new Path(fsPath);
            if(pfsPath.paths.length === parentPath.paths.length + 1 && startsWith(fsPath, seekPath))
            {
                results.push({
                    fs: this.fileSystems[fsPath],
                    path: pfsPath
                });
            }
        }

        return results;
    }

    /**
     * Get the file system managing the provided path.
     * 
     * @param path Requested path
     */
    getFileSystemAsync(path : Path) : Promise<{ fs : FileSystem, rootPath : Path, subPath : Path }>
    {
        return promisifyCall((cb) => this.getFileSystem(path, (fs, rootPath, subPath) => cb(undefined, { fs, rootPath, subPath })));
    }

    /**
     * Get the file system managing the provided path.
     * 
     * @param path Requested path
     * @param callback Callback containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
    getFileSystem(path : Path, callback : (fs : FileSystem, rootPath : Path, subPath : Path) => void) : void
    {
        const result = this.getFileSystemSync(path);
        callback(result.fs, result.rootPath, result.subPath);
    }

    /**
     * Get synchronously the file system managing the provided path.
     * 
     * @param path Requested path
     * @returns Object containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
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

    /**
     * Action to execute when the requested method is unknown.
     * 
     * @param unknownMethod Action to execute
     */
    onUnknownMethod(unknownMethod : HTTPMethod)
    {
        this.unknownMethod = unknownMethod;
    }

    /**
     * List all resources in every depth.
     */
    listResourcesAsync() : Promise<string[]>
    /**
     * List all resources in every depth.
     * 
     * @param root The root folder where to start the listing
     */
    listResourcesAsync(root : string | Path) : Promise<string[]>
    listResourcesAsync(root ?: string | Path) : Promise<string[]>
    {
        return promisifyCall((cb) => this.listResources(root, (paths) => cb(undefined, paths)));
    }

    /**
     * List all resources in every depth.
     * 
     * @param callback Callback providing the list of resources
     */
    listResources(callback : (paths : string[]) => void) : void
    /**
     * List all resources in every depth.
     * 
     * @param root The root folder where to start the listing
     * @param callback Callback providing the list of resources
     */
    listResources(root : string | Path, callback : (paths : string[]) => void) : void
    listResources(_root : string | Path | ((paths : string[]) => void), _callback ?: (paths : string[]) => void) : void
    {
        const root = new Path(Path.isPath(_root) ? _root as (string | Path) : '/');
        const callback = _callback ? _callback : _root as ((paths : string[]) => void);

        const output = [];
        output.push(root.toString());
        
        this.getResource(this.createExternalContext(), root, (e, resource) => {
            resource.readDir(true, (e, files) => {
                if(e || files.length === 0)
                    return callback(output);

                let nb = files.length;

                files.forEach((fileName) => {
                    const childPath = root.getChildPath(fileName);
                    this.listResources(childPath, (outputs) => {
                        outputs.forEach((o) => output.push(o));
                        if(--nb === 0)
                            callback(output);
                    })
                })
            });
        });
    }

    /**
     * Start the WebDAV server.
     * 
     * @param port Port of the server
     */
    startAsync(port : number) : Promise<http.Server>
    startAsync(port ?: number) : Promise<http.Server>
    {
        return promisifyCall((cb) => this.start(port, (server) => cb(undefined, server)));
    }

    /**
     * Start the WebDAV server.
     * 
     * @param port Port of the server
     */
    start(port : number)
    /**
     * Start the WebDAV server.
     * 
     * @param callback Callback to call when the server is started
     */
    start(callback : WebDAVServerStartCallback)
    /**
     * Start the WebDAV server.
     * 
     * @param port Port of the server
     * @param callback Callback to call when the server is started
     */
    start(port : number, callback : WebDAVServerStartCallback)
    start(port ?: number | WebDAVServerStartCallback, callback ?: WebDAVServerStartCallback)
    {
        startStop.start.bind(this)(port, callback);
    }
    /**
     * Stop the WebDAV server.
     */
    stopAsync() : Promise<void>
    {
        return promisifyCall((cb) => this.stop(cb));
    }
    /**
     * Stop the WebDAV server.
     */
    stop = startStop.stop

    /**
     * Execute a request as if the HTTP server received it.
     */
    executeRequest = startStop.executeRequest.bind(this)

    // Persistence
    protected autoSavePool ?: persistence.AutoSavePool;

    /**
     * Start the auto-save feature of the server. Use the server's options as settings.
     */
    autoSave()
    /**
     * Start the auto-save feature of the server.
     * 
     * @param options Settings of the auto-save.
     */
    autoSave(options : IAutoSave)
    autoSave(options ?: IAutoSave)
    {
        const fn = persistence.autoSave.bind(this);

        if(options)
            fn(options);
        else if(this.options.autoSave)
            fn(this.options.autoSave);
    }

    /**
     * Force the autoSave system to save when available.
     */
    forceAutoSave() : void
    {
        this.autoSavePool.save();
    }

    /**
     * Load the previous save made by the 'autoSave' system.
     */
    autoLoadAsync() : Promise<void>
    {
        return promisifyCall((cb) => this.autoLoad(cb));
    }
    /**
     * Load the previous save made by the 'autoSave' system.
     */
    autoLoad = persistence.autoLoad
    /**
     * Load a state of the resource tree.
     */
    loadAsync(data : SerializedData, serializers : FileSystemSerializer[]) : Promise<void>
    {
        return promisifyCall((cb) => this.load(data, serializers, cb));
    }
    /**
     * Load a state of the resource tree.
     */
    load = persistence.load
    /**
     * Save the state of the resource tree.
     */
    saveAsync() : Promise<SerializedData>
    {
        return promisifyCall((cb) => this.save(cb));
    }
    /**
     * Save the state of the resource tree.
     */
    save = persistence.save

    /**
     * Define an action to execute when a HTTP method is requested.
     * 
     * @param name Name of the method to bind to
     * @param manager Action to execute when the method is requested
     */
    method(name : string, manager : HTTPMethod)
    {
        this.methods[this.normalizeMethodName(name)] = manager;
    }

    /**
     * Attach a listener to an event.
     * 
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(event : ServerEvent, listener : EventCallback) : this
    /**
     * Attach a listener to an event.
     * 
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(event : string, listener : EventCallback) : this
    on(event : ServerEvent | string, listener : EventCallback) : this
    {
        if(!this.events[event])
            this.events[event] = [];
        this.events[event].push(listener);

        return this;
    }

    /**
     * Remove an event.
     * 
     * @param event Name of the event.
     */
    removeEvent(event : ServerEvent) : this
    /**
     * Remove an event.
     * 
     * @param event Name of the event.
     */
    removeEvent(event : string) : this
    /**
     * Remove a listener to an event.
     * 
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    removeEvent(event : ServerEvent, listener : EventCallback) : this
    /**
     * Remove a listener to an event.
     * 
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    removeEvent(event : string, listener : EventCallback) : this
    removeEvent(event : ServerEvent | string, listener ?: EventCallback) : this
    {
        if(listener)
        {
            if(this.events[event])
            {
                const eventList = this.events[event];
                
                for(let index = 0; index < eventList.length; ++index)
                {
                    if(eventList[index] === listener)
                    {
                        eventList.splice(index, 1);
                        --index;
                    }
                }
            }
        }
        else
        {
            delete this.events[event];
        }

        return this;
    }
    
    /**
     * Trigger an event.
     * 
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param fs File system on which the event happened.
     * @param path Path of the resource on which the event happened.
     */
    emit(event : string, ctx : RequestContext, fs : FileSystem, path : Path | string, data ?: any) : void
    {
        if(!this.events[event])
            return;

        this.events[event].forEach((l) => process.nextTick(() => l(ctx, fs, path.constructor === String ? new Path(path as string) : path as Path, data)));
    }

    /**
     * Normalize the name of the method.
     */
    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    // Before / After execution
    /**
     * Invoke the BeforeRequest events.
     * 
     * @param base Context of the request
     * @param callback Callback to execute when all BeforeRequest events have been executed
     */
    invokeBeforeRequest(base : RequestContext, callback) : void
    {
        beforeAfter.invokeBeforeRequest.bind(this)(base, callback);
    }
    /**
     * Invoke the AfterRequest events.
     * 
     * @param base Context of the request
     * @param callback Callback to execute when all AfterRequest events have been executed
     */
    invokeAfterRequest(base : RequestContext, callback) : void
    {
        beforeAfter.invokeAfterRequest.bind(this)(base, callback);
    }
    /**
     * Action to execute before an operation is executed when a HTTP request is received.
     * 
     * @param manager Action to execute
     */
    beforeRequest(manager : beforeAfter.RequestListener) : void
    {
        this.beforeManagers.push(manager);
    }
    /**
     * Action to execute after an operation is executed when a HTTP request is received.
     * 
     * @param manager Action to execute
     */
    afterRequest(manager : beforeAfter.RequestListener) : void
    {
        this.afterManagers.push(manager);
    }
}
