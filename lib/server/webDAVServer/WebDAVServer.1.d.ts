/// <reference types="node" />
import { WebDAVRequest } from '../WebDAVRequest';
import { WebDAVServerOptions } from '../WebDAVServerOptions';
import { IResource, ReturnCallback } from '../../resource/IResource';
import { HTTPAuthentication } from '../../user/authentication/HTTPAuthentication';
import { IPrivilegeManager } from '../../user/privilege/IPrivilegeManager';
import { FSPath } from '../../manager/FSManager';
import { IUserManager } from '../../user/IUserManager';
import * as http from 'http';
import * as persistence from './Persistence';
import * as beforeAfter from './BeforeAfter';
export { WebDAVServerOptions } from '../WebDAVServerOptions';
export declare type WebDAVServerStartCallback = (server?: http.Server) => void;
export interface IResourceTreeNode {
    r?: IResource;
    resource?: IResource;
    c?: ResourceTreeNode[];
    children?: ResourceTreeNode[];
}
export declare type ResourceTreeNode = IResourceTreeNode | IResource | IResourceTreeNode[] | IResource[];
export declare class WebDAVServer {
    httpAuthentication: HTTPAuthentication;
    privilegeManager: IPrivilegeManager;
    rootResource: IResource;
    userManager: IUserManager;
    options: WebDAVServerOptions;
    methods: object;
    protected beforeManagers: WebDAVRequest[];
    protected afterManagers: WebDAVRequest[];
    protected unknownMethod: WebDAVRequest;
    protected server: http.Server;
    constructor(options?: WebDAVServerOptions);
    getResourceFromPath(path: FSPath | string[] | string, callback: ReturnCallback<IResource>): any;
    getResourceFromPath(path: FSPath | string[] | string, rootResource: IResource, callback: ReturnCallback<IResource>): any;
    addResourceTree(resoureceTree: ResourceTreeNode, callback: (e: Error) => void): any;
    addResourceTree(rootResource: IResource, resoureceTree: ResourceTreeNode, callback: (e: Error) => void): any;
    onUnknownMethod(unknownMethod: WebDAVRequest): void;
    start(port: number): any;
    start(callback: WebDAVServerStartCallback): any;
    start(port: number, callback: WebDAVServerStartCallback): any;
    stop(callback: () => void): void;
    load: typeof persistence.load;
    save: typeof persistence.save;
    method(name: string, manager: WebDAVRequest): void;
    protected normalizeMethodName(method: string): string;
    beforeRequest: typeof beforeAfter.beforeRequest;
    afterRequest: typeof beforeAfter.afterRequest;
    protected invokeBARequest: typeof beforeAfter.invokeBARequest;
    protected invokeBeforeRequest: typeof beforeAfter.invokeBeforeRequest;
    protected invokeAfterRequest: typeof beforeAfter.invokeAfterRequest;
}
