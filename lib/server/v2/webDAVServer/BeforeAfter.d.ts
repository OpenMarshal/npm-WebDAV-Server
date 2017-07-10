import { HTTPRequestContext } from '../WebDAVRequest';
export declare type RequestListener = (ctx: HTTPRequestContext, next: () => void) => void;
export declare function invokeBeforeRequest(base: HTTPRequestContext, callback: any): void;
export declare function invokeAfterRequest(base: HTTPRequestContext, callback: any): void;
