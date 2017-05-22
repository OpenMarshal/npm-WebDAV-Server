/// <reference types="node" />
import { BasicPrivilege } from '../user/privilege/IPrivilegeManager';
import { IResource, ReturnCallback } from '../resource/Resource';
import { XMLElement } from '../helper/XML';
import { WebDAVServer } from '../server/WebDAVServer';
import { FSPath } from '../manager/FSManager';
import { IUser } from '../user/IUser';
import * as http from 'http';
export declare class MethodCallArgs {
    server: WebDAVServer;
    request: http.IncomingMessage;
    response: http.ServerResponse;
    exit: () => void;
    callback: () => void;
    contentLength: number;
    depth: number;
    host: string;
    path: FSPath;
    uri: string;
    data: string;
    user: IUser;
    protected constructor(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, exit: () => void, callback: () => void);
    static create(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, callback: (error: Error, mca: MethodCallArgs) => void): void;
    requireCustomPrivilege(privileges: string | string[], resource: IResource, callback: () => void): void;
    requirePrivilege(privileges: BasicPrivilege | BasicPrivilege[], resource: IResource, callback: () => void): void;
    requireErCustomPrivilege(privileges: string | string[], resource: IResource, callback: (error: Error, can: boolean) => void): void;
    requireErPrivilege(privileges: BasicPrivilege | BasicPrivilege[], resource: IResource, callback: (error: Error, can: boolean) => void): void;
    askForAuthentication(checkForUser: boolean, callback: (error: Error) => void): void;
    accept(regex: RegExp[]): number;
    findHeader(name: string, defaultValue?: string): string;
    getResource(callback: ReturnCallback<IResource>): void;
    dateISO8601(ticks: number): string;
    fullUri(uri?: string): string;
    prefixUri(): string;
    getResourcePath(resource: IResource, callback: ReturnCallback<string>): void;
    writeXML(xmlObject: XMLElement | object): void;
    setCode(code: number, message?: string): void;
}
export default MethodCallArgs;
