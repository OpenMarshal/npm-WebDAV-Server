import { MethodCallArgs, WebDAVRequest } from '../WebDAVRequest';
export declare function beforeRequest(manager: WebDAVRequest): void;
export declare function afterRequest(manager: WebDAVRequest): void;
export declare function invokeBeforeRequest(base: MethodCallArgs, callback: any): void;
export declare function invokeAfterRequest(base: MethodCallArgs, callback: any): void;
