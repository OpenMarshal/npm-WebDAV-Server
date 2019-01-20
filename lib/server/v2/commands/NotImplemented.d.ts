/// <reference types="node" />
import { HTTPRequestContext, HTTPMethod } from '../WebDAVRequest';
export default class implements HTTPMethod {
    unchunked(ctx: HTTPRequestContext, data: Buffer, callback: () => void): void;
}
