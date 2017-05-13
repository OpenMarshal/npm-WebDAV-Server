/// <reference types="node" />
import { IResource, ReturnCallback } from '../resource/Resource';
import { WebDAVServer } from '../server/WebDAVServer';
import { FSPath } from '../manager/FSManager';
import * as http from 'http';
export declare class MethodCallArgs {
    server: WebDAVServer;
    request: http.IncomingMessage;
    response: http.ServerResponse;
    callback: () => void;
    contentLength: number;
    depth: number;
    host: string;
    path: FSPath;
    uri: string;
    data: string;
    constructor(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, callback: () => void);
    findHeader(name: string, defaultValue?: string): string;
    getResource(callback: ReturnCallback<IResource>): void;
    dateISO8601(ticks: number): string;
    fullUri(uri?: string): string;
    prefixUri(): string;
    getResourcePath(resource: IResource, callback: ReturnCallback<string>): void;
    setCode(code: number, message?: string): void;
}
export default MethodCallArgs;
