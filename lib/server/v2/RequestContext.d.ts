/// <reference types="node" />
import { BasicPrivilege } from '../../user/v2/privilege/IPrivilegeManager';
import { XMLElement } from '../../helper/XML';
import { WebDAVServer } from './webDAVServer/WebDAVServer';
import { FileSystem } from '../../manager/v2/fileSystem/FileSystem';
import { ReturnCallback } from '../../manager/v2/fileSystem/CommonTypes';
import { Resource } from '../../manager/v2/fileSystem/Resource';
import { Path } from '../../manager/v2/Path';
import { IUser } from '../../user/v2/IUser';
import * as http from 'http';
export declare class RequestContextHeaders {
    protected request: http.IncomingMessage;
    contentLength: number;
    isSource: boolean;
    depth: number;
    host: string;
    constructor(request: http.IncomingMessage);
    find(name: string, defaultValue?: string): string;
    findBestAccept(defaultType?: string): string;
}
export interface RequestedResource {
    path: Path;
    uri: string;
}
export interface RequestContextExternalOptions {
    headers?: {
        [name: string]: string;
    };
    url?: string;
    user?: IUser;
}
export declare class DefaultRequestContextExternalOptions implements RequestContextExternalOptions {
    headers: {
        [name: string]: string;
    };
    url: string;
}
export declare class RequestContext {
    server: WebDAVServer;
    request: http.IncomingMessage;
    response: http.ServerResponse;
    exit: () => void;
    headers: RequestContextHeaders;
    requested: RequestedResource;
    user: IUser;
    protected constructor(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, exit: () => void);
    static createExternal(server: WebDAVServer): RequestContext;
    static createExternal(server: WebDAVServer, callback: (error: Error, ctx: RequestContext) => void): RequestContext;
    static createExternal(server: WebDAVServer, options: RequestContextExternalOptions): RequestContext;
    static createExternal(server: WebDAVServer, options: RequestContextExternalOptions, callback: (error: Error, ctx: RequestContext) => void): RequestContext;
    static create(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, callback: (error: Error, ctx: RequestContext) => void): void;
    noBodyExpected(callback: () => void): void;
    checkIfHeader(resource: Resource, callback: () => void): any;
    checkIfHeader(fs: FileSystem, path: Path, callback: () => void): any;
    requirePrivilegeEx(privileges: BasicPrivilege | BasicPrivilege[], callback: () => void): any;
    requirePrivilegeEx(privileges: string | string[], callback: () => void): any;
    requirePrivilege(privileges: BasicPrivilege | BasicPrivilege[], callback: (error: Error, can: boolean) => void): any;
    requirePrivilege(privileges: string | string[], callback: (error: Error, can: boolean) => void): any;
    askForAuthentication(checkForUser: boolean, callback: (error: Error) => void): void;
    getResource(callback: ReturnCallback<Resource>): any;
    getResource(path: Path | string, callback: ReturnCallback<Resource>): any;
    fullUri(uri?: string): string;
    prefixUri(): string;
    writeBody(xmlObject: XMLElement | object): void;
    setCode(code: number, message?: string): void;
}
export default RequestContext;
