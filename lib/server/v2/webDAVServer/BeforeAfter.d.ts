import { RequestContext } from '../WebDAVRequest';
export interface RequestListener {
    (ctx: RequestContext, next: () => void): void;
}
export declare function invokeBeforeRequest(base: RequestContext, callback: any): void;
export declare function invokeAfterRequest(base: RequestContext, callback: any): void;
