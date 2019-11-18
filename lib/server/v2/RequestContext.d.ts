/// <reference types="node" />
import { XMLElement } from 'xml-js-builder';
import { WebDAVServer } from './webDAVServer/WebDAVServer';
import { FileSystem } from '../../manager/v2/fileSystem/FileSystem';
import { ReturnCallback } from '../../manager/v2/fileSystem/CommonTypes';
import { Resource } from '../../manager/v2/fileSystem/Resource';
import { Path } from '../../manager/v2/Path';
import { IUser } from '../../user/v2/IUser';
import * as http from 'http';
export declare class RequestContextHeaders {
    protected headers: {
        [name: string]: string | string[];
    };
    contentLength: number;
    isSource: boolean;
    depth: number;
    host: string;
    constructor(headers: {
        [name: string]: string | string[];
    });
    find(name: string, defaultValue?: string): string;
    findBestAccept(defaultType?: string): string;
}
export interface RequestedResource {
    path: Path;
    uri: string;
}
export interface RequestContextExternalOptions {
    rootPath?: string;
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
    user: IUser;
}
export declare class RequestContext {
    overridePrivileges: boolean;
    requested: RequestedResource;
    rootPath: string;
    headers: RequestContextHeaders;
    server: WebDAVServer;
    user: IUser;
    protected constructor(server: WebDAVServer, uri: string, headers: {
        [name: string]: string | string[];
    }, rootPath?: string);
    getResourceAsync(): Promise<Resource>;
    getResourceAsync(path: Path | string): Promise<Resource>;
    getResource(callback: ReturnCallback<Resource>): void;
    getResource(path: Path | string, callback: ReturnCallback<Resource>): void;
    getResourceSync(path?: Path | string): Resource;
    fullUri(uri?: string): string;
    prefixUri(): string;
}
export declare class ExternalRequestContext extends RequestContext {
    static create(server: WebDAVServer): ExternalRequestContext;
    static create(server: WebDAVServer, callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
    static create(server: WebDAVServer, options: RequestContextExternalOptions): ExternalRequestContext;
    static create(server: WebDAVServer, options: RequestContextExternalOptions, callback: (error: Error, ctx: ExternalRequestContext) => void): ExternalRequestContext;
}
export declare class HTTPRequestContext extends RequestContext {
    responseBody: string;
    request: http.IncomingMessage;
    response: http.ServerResponse;
    exit: () => void;
    protected constructor(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, exit: () => void, rootPath?: string);
    static create(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, callback: (error: Error, ctx: HTTPRequestContext) => void): void;
    static create(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, rootPath: string, callback: (error: Error, ctx: HTTPRequestContext) => void): void;
    static encodeURL(url: string): string;
    noBodyExpected(callback: () => void): void;
    checkIfHeader(resource: Resource, callback: () => void): any;
    checkIfHeader(fs: FileSystem, path: Path, callback: () => void): any;
    askForAuthentication(checkForUser: boolean, callback: (error: Error) => void): void;
    writeBody(xmlObject: XMLElement | object): void;
    setCode(code: number, message?: string): void;
    protected static defaultErrorStatusCodes: {
        error: Error;
        code: number;
    }[];
    static defaultStatusCode(error: Error): number;
    setCodeFromError(error: Error): boolean;
}
