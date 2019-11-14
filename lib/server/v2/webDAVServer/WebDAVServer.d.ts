/// <reference types="node" />
import { ExternalRequestContext, RequestContextExternalOptions, RequestContext } from '../RequestContext';
import { WebDAVServerOptions, IAutoSave } from '../WebDAVServerOptions';
import { HTTPAuthentication } from '../../../user/v2/authentication/HTTPAuthentication';
import { PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager';
import { ReturnCallback } from '../../../manager/v2/fileSystem/CommonTypes';
import { FileSystem } from '../../../manager/v2/fileSystem/FileSystem';
import { HTTPMethod } from '../WebDAVRequest';
import { Resource } from '../../../manager/v2/fileSystem/Resource';
import { Path } from '../../../manager/v2/Path';
import * as persistence from './Persistence';
import * as beforeAfter from './BeforeAfter';
import * as startStop from './StartStop';
import * as https from 'https';
import * as http from 'http';
import { SerializedData, FileSystemSerializer } from '../../../manager/v2/export';
export declare type WebDAVServerStartCallback = (server?: http.Server) => void;
export declare type FileSystemEvent = 'create' | 'delete' | 'openReadStream' | 'openWriteStream' | 'move' | 'copy' | 'rename' | 'before-create' | 'before-delete' | 'before-openReadStream' | 'before-openWriteStream' | 'before-move' | 'before-copy' | 'before-rename';
export declare type ServerEvent = FileSystemEvent;
export declare type EventCallback = (ctx: RequestContext, fs: FileSystem, path: Path, data?: any) => void;
export declare class WebDAVServer {
    httpAuthentication: HTTPAuthentication;
    privilegeManager: PrivilegeManager;
    options: WebDAVServerOptions;
    methods: {
        [methodName: string]: HTTPMethod;
    };
    events: {
        [event: string]: EventCallback[];
    };
    protected beforeManagers: beforeAfter.RequestListener[];
    protected afterManagers: beforeAfter.RequestListener[];
    protected unknownMethod: HTTPMethod;
    protected server: http.Server | https.Server;
    protected fileSystems: {
        [path: string]: FileSystem;
    };
    constructor(options?: WebDAVServerOptions);
    protected isSameFileSystem(fs: FileSystem, path: string, checkByReference: boolean): boolean;
    /**
     * Synchronously create an external context with full rights.
     *
     * @returns The created context.
     */
    createExternalContext(): ExternalRequestContext;
    /**
     * Create an external context with full rights.
     *
     * @param callback Callback containing the created context.
     * @returns The created context.
     */
    createExternalContext(callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
    /**
     * Create an external context with specified options.
     *
     * @param options Options of the context
     * @returns The created context.
     */
    createExternalContext(options: RequestContextExternalOptions): ExternalRequestContext;
    /**
     * Create an external context with specified options.
     *
     * @param options Options of the context
     * @param callback Callback containing the created context.
     * @returns The created context.
     */
    createExternalContext(options: RequestContextExternalOptions, callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
    /**
     * Get the root file system.
     *
     * @returns The root file system
     */
    rootFileSystem(): FileSystem;
    /**
     * Get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     */
    getResourceAsync(ctx: RequestContext, path: Path | string): Promise<Resource>;
    /**
     * Get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     * @param callback Callback containing the requested resource
     */
    getResource(ctx: RequestContext, path: Path | string, callback: ReturnCallback<Resource>): void;
    /**
     * Synchronously get a resource object to manage a resource from its path.
     *
     * @param ctx Context of the request
     * @param path Path of the resource
     * @returns The requested resource
     */
    getResourceSync(ctx: RequestContext, path: Path | string): Resource;
    /**
     * Map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     */
    setFileSystemAsync(path: Path | string, fs: FileSystem): Promise<boolean>;
    /**
     * Map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     */
    setFileSystemAsync(path: Path | string, fs: FileSystem, override: boolean): Promise<boolean>;
    /**
     * Map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param callback Callback containing the status of the mounting
     */
    setFileSystem(path: Path | string, fs: FileSystem, callback: (successed?: boolean) => void): void;
    /**
     * Map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     * @param callback Callback containing the status of the mounting
     */
    setFileSystem(path: Path | string, fs: FileSystem, override: boolean, callback: (successed?: boolean) => void): void;
    /**
     * Synchronously map/mount a file system to a path.
     *
     * @param path Path where to mount the file system
     * @param fs File system to mount
     * @param override Define if the mounting can override a previous mounted file system
     * @returns The status of the mounting
     */
    setFileSystemSync(path: Path | string, fs: FileSystem, override?: boolean): boolean;
    /**
     * Remove a file system based on its path.
     *
     * @param path Path of the file system to remove
     * @param callback Callback containing the number of removed file systems (0 or 1)
     */
    removeFileSystem(path: Path | string, callback: (nbRemoved?: number) => void): void;
    /**
     * Remove a file system.
     *
     * @param fs File system to remove
     * @param callback Callback containing the number of removed file systems
     */
    removeFileSystem(fs: FileSystem, callback: (nbRemoved?: number) => void): void;
    /**
     * Remove a file system.
     *
     * @param fs File system to remove
     * @param checkByReference Define if the file systems must be matched by reference or by its serializer's UID
     * @param callback Callback containing the number of removed file systems
     */
    removeFileSystem(fs: FileSystem, checkByReference: boolean, callback: (nbRemoved?: number) => void): void;
    /**
     * Synchronously remove a file system.
     *
     * @param fs File system to remove
     * @returns The number of removed file systems (0 or 1)
     */
    removeFileSystemSync(path: Path | string): number;
    /**
     * Synchronously remove a file system.
     *
     * @param fs File system to remove
     * @param checkByReference Define if the file systems must be matched by reference or by its serializer's UID
     * @returns The number of removed file systems
     */
    removeFileSystemSync(fs: FileSystem, checkByReference?: boolean): number;
    /**
     * Get the mount path of a file system.
     *
     * @param fs File system
     * @param callback Callback containing the mount path of the file system
     */
    getFileSystemPath(fs: FileSystem, callback: (path: Path) => void): void;
    /**
     * Get the mount path of a file system.
     *
     * @param fs File system
     * @param checkByReference Define if the file system must be matched by reference or by its serializer's UID
     * @param callback Callback containing the mount path of the file system
     */
    getFileSystemPath(fs: FileSystem, checkByReference: boolean, callback: (path: Path) => void): void;
    /**
     * Synchronously get the mount path of a file system.
     *
     * @param fs File system
     * @param checkByReference Define if the file system must be matched by reference or by its serializer's UID
     * @returns The mount path of the file system
     */
    getFileSystemPathSync(fs: FileSystem, checkByReference?: boolean): Path;
    /**
     * Get the list of file systems mounted on or under the parentPath.
     *
     * @param parentPath Path from which list sub file systems
     * @param callback Callback containing the list of file systems found and their mount path
     */
    getChildFileSystems(parentPath: Path, callback: (fss: {
        fs: FileSystem;
        path: Path;
    }[]) => void): void;
    /**
     * Synchronously get the list of file systems mounted on or under the parentPath.
     *
     * @param parentPath Path from which list sub file systems
     * @returns Object containing the list of file systems found and their mount path
     */
    getChildFileSystemsSync(parentPath: Path): {
        fs: FileSystem;
        path: Path;
    }[];
    /**
     * Get the file system managing the provided path.
     *
     * @param path Requested path
     */
    getFileSystemAsync(path: Path): Promise<{
        fs: FileSystem;
        rootPath: Path;
        subPath: Path;
    }>;
    /**
     * Get the file system managing the provided path.
     *
     * @param path Requested path
     * @param callback Callback containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
    getFileSystem(path: Path, callback: (fs: FileSystem, rootPath: Path, subPath: Path) => void): void;
    /**
     * Get synchronously the file system managing the provided path.
     *
     * @param path Requested path
     * @returns Object containing the file system, the mount path of the file system and the sub path from the mount path to the requested path
     */
    getFileSystemSync(path: Path): {
        fs: FileSystem;
        rootPath: Path;
        subPath: Path;
    };
    /**
     * Action to execute when the requested method is unknown.
     *
     * @param unknownMethod Action to execute
     */
    onUnknownMethod(unknownMethod: HTTPMethod): void;
    /**
     * List all resources in every depth.
     */
    listResourcesAsync(): Promise<string[]>;
    /**
     * List all resources in every depth.
     *
     * @param root The root folder where to start the listing
     */
    listResourcesAsync(root: string | Path): Promise<string[]>;
    /**
     * List all resources in every depth.
     *
     * @param callback Callback providing the list of resources
     */
    listResources(callback: (paths: string[]) => void): void;
    /**
     * List all resources in every depth.
     *
     * @param root The root folder where to start the listing
     * @param callback Callback providing the list of resources
     */
    listResources(root: string | Path, callback: (paths: string[]) => void): void;
    /**
     * Start the WebDAV server.
     *
     * @param port Port of the server
     */
    startAsync(port: number): Promise<http.Server>;
    /**
     * Start the WebDAV server.
     *
     * @param port Port of the server
     */
    start(port: number): any;
    /**
     * Start the WebDAV server.
     *
     * @param callback Callback to call when the server is started
     */
    start(callback: WebDAVServerStartCallback): any;
    /**
     * Start the WebDAV server.
     *
     * @param port Port of the server
     * @param callback Callback to call when the server is started
     */
    start(port: number, callback: WebDAVServerStartCallback): any;
    /**
     * Stop the WebDAV server.
     */
    stopAsync(): Promise<void>;
    /**
     * Stop the WebDAV server.
     */
    stop: typeof startStop.stop;
    /**
     * Execute a request as if the HTTP server received it.
     */
    executeRequest: any;
    protected autoSavePool?: persistence.AutoSavePool;
    /**
     * Start the auto-save feature of the server. Use the server's options as settings.
     */
    autoSave(): any;
    /**
     * Start the auto-save feature of the server.
     *
     * @param options Settings of the auto-save.
     */
    autoSave(options: IAutoSave): any;
    /**
     * Force the autoSave system to save when available.
     */
    forceAutoSave(): void;
    /**
     * Load the previous save made by the 'autoSave' system.
     */
    autoLoadAsync(): Promise<void>;
    /**
     * Load the previous save made by the 'autoSave' system.
     */
    autoLoad: typeof persistence.autoLoad;
    /**
     * Load a state of the resource tree.
     */
    loadAsync(data: SerializedData, serializers: FileSystemSerializer[]): Promise<void>;
    /**
     * Load a state of the resource tree.
     */
    load: typeof persistence.load;
    /**
     * Save the state of the resource tree.
     */
    saveAsync(): Promise<SerializedData>;
    /**
     * Save the state of the resource tree.
     */
    save: typeof persistence.save;
    /**
     * Define an action to execute when a HTTP method is requested.
     *
     * @param name Name of the method to bind to
     * @param manager Action to execute when the method is requested
     */
    method(name: string, manager: HTTPMethod): void;
    /**
     * Attach a listener to an event.
     *
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(event: ServerEvent, listener: EventCallback): this;
    /**
     * Attach a listener to an event.
     *
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    on(event: string, listener: EventCallback): this;
    /**
     * Remove an event.
     *
     * @param event Name of the event.
     */
    removeEvent(event: ServerEvent): this;
    /**
     * Remove an event.
     *
     * @param event Name of the event.
     */
    removeEvent(event: string): this;
    /**
     * Remove a listener to an event.
     *
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    removeEvent(event: ServerEvent, listener: EventCallback): this;
    /**
     * Remove a listener to an event.
     *
     * @param event Name of the event.
     * @param listener Listener of the event.
     */
    removeEvent(event: string, listener: EventCallback): this;
    /**
     * Trigger an event.
     *
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param fs File system on which the event happened.
     * @param path Path of the resource on which the event happened.
     */
    emit(event: string, ctx: RequestContext, fs: FileSystem, path: Path | string, data?: any): void;
    /**
     * Normalize the name of the method.
     */
    protected normalizeMethodName(method: string): string;
    /**
     * Invoke the BeforeRequest events.
     *
     * @param base Context of the request
     * @param callback Callback to execute when all BeforeRequest events have been executed
     */
    invokeBeforeRequest(base: RequestContext, callback: any): void;
    /**
     * Invoke the AfterRequest events.
     *
     * @param base Context of the request
     * @param callback Callback to execute when all AfterRequest events have been executed
     */
    invokeAfterRequest(base: RequestContext, callback: any): void;
    /**
     * Action to execute before an operation is executed when a HTTP request is received.
     *
     * @param manager Action to execute
     */
    beforeRequest(manager: beforeAfter.RequestListener): void;
    /**
     * Action to execute after an operation is executed when a HTTP request is received.
     *
     * @param manager Action to execute
     */
    afterRequest(manager: beforeAfter.RequestListener): void;
}
