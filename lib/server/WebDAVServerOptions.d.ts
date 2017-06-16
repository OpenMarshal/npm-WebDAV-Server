/// <reference types="node" />
import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication';
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager';
import { IUserManager } from '../user/IUserManager';
import { IResource } from '../resource/IResource';
import { Writable } from 'stream';
import * as https from 'https';
export interface IAutoSave {
    treeFilePath: string;
    tempTreeFilePath: string;
    onSaveError?: (error: Error) => void;
    streamProvider?: (inputStream: Writable, callback: (outputStream?: Writable) => void) => void;
}
export declare class WebDAVServerOptions {
    requireAuthentification?: boolean;
    httpAuthentication?: HTTPAuthentication;
    privilegeManager?: IPrivilegeManager;
    rootResource?: IResource;
    userManager?: IUserManager;
    lockTimeout?: number;
    strictMode?: boolean;
    canChunk?: boolean;
    hostname?: string;
    https?: https.ServerOptions;
    port?: number;
    serverName?: string;
    version?: string;
    autoSave?: IAutoSave;
}
export default WebDAVServerOptions;
export declare function setDefaultServerOptions(options: WebDAVServerOptions): WebDAVServerOptions;
