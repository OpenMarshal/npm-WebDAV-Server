import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication';
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager';
import { IUserManager } from '../user/IUserManager';
import { IResource } from '../resource/IResource';
export declare class WebDAVServerOptions {
    requireAuthentification?: boolean;
    httpAuthentication?: HTTPAuthentication;
    privilegeManager?: IPrivilegeManager;
    rootResource?: IResource;
    userManager?: IUserManager;
    lockTimeout?: number;
    canChunk?: boolean;
    hostname?: string;
    port?: number;
}
export default WebDAVServerOptions;
export declare function setDefaultServerOptions(options: WebDAVServerOptions): WebDAVServerOptions;
