/// <reference types="node" />
import { WebDAVServerOptions } from '../WebDAVServerOptions';
import { ResourceTreeNode, WebDAVServerStartCallback } from './Types';
import { IResource, ReturnCallback } from '../../../resource/v1/IResource';
import { MethodCallArgs, WebDAVRequest } from '../WebDAVRequest';
import { HTTPAuthentication } from '../../../user/v1/authentication/HTTPAuthentication';
import { IPrivilegeManager } from '../../../user/v1/privilege/IPrivilegeManager';
import { FSPath } from '../../../manager/v1/FSManager';
import { IUserManager } from '../../../user/v1/IUserManager';
import * as persistence from './Persistence';
import * as beforeAfter from './BeforeAfter';
import * as startStop from './StartStop';
import * as events from './Events';
import * as https from 'https';
import * as http from 'http';
export { WebDAVServerOptions } from '../WebDAVServerOptions';
/**
 * @deprecated This is a class of the versoin 1 of webdav-server, prefer using the version 2. This class and all v1 classes will be removed in a future release.
 */
export declare class WebDAVServer {
    httpAuthentication: HTTPAuthentication;
    privilegeManager: IPrivilegeManager;
    rootResource: IResource;
    userManager: IUserManager;
    options: WebDAVServerOptions;
    methods: {
        [methodName: string]: WebDAVRequest;
    };
    protected beforeManagers: WebDAVRequest[];
    protected afterManagers: WebDAVRequest[];
    protected unknownMethod: WebDAVRequest;
    protected server: http.Server | https.Server;
    constructor(options?: WebDAVServerOptions);
    getResourceFromPath(arg: MethodCallArgs, path: FSPath | string[] | string, callback: ReturnCallback<IResource>): any;
    getResourceFromPath(arg: MethodCallArgs, path: FSPath | string[] | string, rootResource: IResource, callback: ReturnCallback<IResource>): any;
    addResourceTree(resoureceTree: ResourceTreeNode, callback: (e: Error) => void): any;
    addResourceTree(rootResource: IResource, resoureceTree: ResourceTreeNode, callback: (e: Error) => void): any;
    onUnknownMethod(unknownMethod: WebDAVRequest): void;
    start(port: number): any;
    start(callback: WebDAVServerStartCallback): any;
    start(port: number, callback: WebDAVServerStartCallback): any;
    stop: typeof startStop.stop;
    autoLoad: typeof persistence.autoLoad;
    load: typeof persistence.load;
    save: typeof persistence.save;
    method(name: string, manager: WebDAVRequest): void;
    protected normalizeMethodName(method: string): string;
    beforeRequest: typeof beforeAfter.beforeRequest;
    afterRequest: typeof beforeAfter.afterRequest;
    protected invokeBeforeRequest: typeof beforeAfter.invokeBeforeRequest;
    protected invokeAfterRequest: typeof beforeAfter.invokeAfterRequest;
    invoke(event: events.EventsName, arg: MethodCallArgs, subjectResource?: IResource | FSPath, details?: events.DetailsType): void;
    on(event: events.EventsName, listener: events.Listener): any;
    on(event: events.EventsName, eventName: string, listener: events.Listener): any;
    clearEvent(event: events.EventsName): void;
    clearEvents(event: events.EventsName): void;
    removeEvent(event: events.EventsName, listener: events.Listener): any;
    removeEvent(event: events.EventsName, eventName: string): any;
}
