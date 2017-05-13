/// <reference types="node" />
import { MethodCallArgs, WebDAVRequest } from './WebDAVRequest';
import { IResource, ReturnCallback } from '../resource/Resource';
import { WebDAVServerOptions } from './WebDAVServerOptions';
import { FSPath } from '../manager/FSManager';
import * as http from 'http';
export { WebDAVServerOptions } from './WebDAVServerOptions';
export declare class WebDAVServer {
    rootResource: IResource;
    methods: object;
    protected beforeManagers: WebDAVRequest[];
    protected afterManagers: WebDAVRequest[];
    protected unknownMethod: WebDAVRequest;
    protected options: WebDAVServerOptions;
    protected server: http.Server;
    constructor(options?: WebDAVServerOptions);
    getResourceFromPath(path: FSPath | string[] | string, callback: ReturnCallback<IResource>): any;
    getResourceFromPath(path: FSPath | string[] | string, rootResource: IResource, callback: ReturnCallback<IResource>): any;
    onUnknownMethod(unknownMethod: WebDAVRequest): void;
    start(port?: number): void;
    stop(callback: () => void): void;
    method(name: string, manager: WebDAVRequest): void;
    beforeRequest(manager: WebDAVRequest): void;
    afterRequest(manager: WebDAVRequest): void;
    protected createMethodCallArgs(req: http.IncomingMessage, res: http.ServerResponse): MethodCallArgs;
    protected normalizeMethodName(method: string): string;
    protected invokeBARequest(collection: WebDAVRequest[], base: MethodCallArgs, callback: any): void;
    protected invokeBeforeRequest(base: MethodCallArgs, callback: any): void;
    protected invokeAfterRequest(base: MethodCallArgs, callback: any): void;
}
