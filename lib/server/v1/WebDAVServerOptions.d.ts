/// <reference types="node" />
import { HTTPAuthentication } from '../../user/v1/authentication/HTTPAuthentication';
import { Writable, Readable } from 'stream';
import { IPrivilegeManager } from '../../user/v1/privilege/IPrivilegeManager';
import { IUserManager } from '../../user/v1/IUserManager';
import { IResource } from '../../resource/v1/IResource';
import { FSManager } from '../../manager/v1/FSManager';
import * as https from 'https';
export interface IAutoSave {
    treeFilePath: string;
    tempTreeFilePath: string;
    onSaveError?: (error: Error) => void;
    streamProvider?: (inputStream: Writable, callback: (outputStream?: Writable) => void) => void;
}
export interface IAutoLoad {
    treeFilePath: string;
    fsManagers: FSManager[];
    streamProvider?: (inputStream: Readable, callback: (outputStream?: Readable) => void) => void;
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
    autoLoad?: IAutoLoad;
}
export default WebDAVServerOptions;
export declare function setDefaultServerOptions(options: WebDAVServerOptions): WebDAVServerOptions;
