/// <reference types="node" />
import { ExternalRequestContext, RequestContextExternalOptions, RequestContext } from '../RequestContext';
import { WebDAVServerOptions, IAutoSave } from '../WebDAVServerOptions';
import { HTTPMethod } from '../WebDAVRequest';
import { HTTPAuthentication } from '../../../user/v2/authentication/HTTPAuthentication';
import { PrivilegeManager } from '../../../user/v2/privilege/PrivilegeManager';
import { FileSystem } from '../../../manager/v2/fileSystem/FileSystem';
import { ReturnCallback } from '../../../manager/v2/fileSystem/CommonTypes';
import { Resource } from '../../../manager/v2/fileSystem/Resource';
import { Path } from '../../../manager/v2/Path';
import * as persistence from './Persistence';
import * as beforeAfter from './BeforeAfter';
import * as startStop from './StartStop';
import * as https from 'https';
import * as http from 'http';
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
    createExternalContext(): ExternalRequestContext;
    createExternalContext(callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
    createExternalContext(options: RequestContextExternalOptions): ExternalRequestContext;
    createExternalContext(options: RequestContextExternalOptions, callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
    rootFileSystem(): FileSystem;
    getResource(ctx: RequestContext, path: Path | string, callback: ReturnCallback<Resource>): void;
    getResourceSync(ctx: RequestContext, path: Path | string): Resource;
    setFileSystem(path: Path | string, fs: FileSystem, callback: (successed?: boolean) => void): void;
    setFileSystem(path: Path | string, fs: FileSystem, override: boolean, callback: (successed?: boolean) => void): void;
    setFileSystemSync(path: Path | string, fs: FileSystem, override?: boolean): boolean;
    removeFileSystem(path: Path | string, callback: (nbRemoved?: number) => void): void;
    removeFileSystem(fs: FileSystem, callback: (nbRemoved?: number) => void): void;
    removeFileSystem(fs: FileSystem, checkByReference: boolean, callback: (nbRemoved?: number) => void): void;
    removeFileSystemSync(path: Path | string): number;
    removeFileSystemSync(fs: FileSystem, checkByReference?: boolean): number;
    getFileSystemPath(fs: FileSystem, callback: (path: Path) => void): void;
    getFileSystemPath(fs: FileSystem, checkByReference: boolean, callback: (path: Path) => void): void;
    getFileSystemPathSync(fs: FileSystem, checkByReference?: boolean): Path;
    getChildFileSystems(parentPath: Path, callback: (fss: {
        fs: FileSystem;
        path: Path;
    }[]) => void): void;
    getChildFileSystemsSync(parentPath: Path): {
        fs: FileSystem;
        path: Path;
    }[];
    getFileSystem(path: Path, callback: (fs: FileSystem, rootPath: Path, subPath: Path) => void): void;
    getFileSystemSync(path: Path): {
        fs: FileSystem;
        rootPath: Path;
        subPath: Path;
    };
    onUnknownMethod(unknownMethod: HTTPMethod): void;
    listResources(callback: (paths: string[]) => void): void;
    listResources(root: string | Path, callback: (paths: string[]) => void): void;
    start(port: number): any;
    start(callback: WebDAVServerStartCallback): any;
    start(port: number, callback: WebDAVServerStartCallback): any;
    stop: typeof startStop.stop;
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
    autoLoad: typeof persistence.autoLoad;
    load: typeof persistence.load;
    save: typeof persistence.save;
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
     * Trigger an event.
     *
     * @param event Name of the event.
     * @param ctx Context of the event.
     * @param fs File system on which the event happened.
     * @param path Path of the resource on which the event happened.
     */
    emit(event: string, ctx: RequestContext, fs: FileSystem, path: Path | string, data?: any): void;
    protected normalizeMethodName(method: string): string;
    invokeBeforeRequest(base: RequestContext, callback: any): void;
    invokeAfterRequest(base: RequestContext, callback: any): void;
    beforeRequest(manager: beforeAfter.RequestListener): void;
    afterRequest(manager: beforeAfter.RequestListener): void;
}
