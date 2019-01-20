/// <reference types="node" />
import { HTTPMethod, HTTPRequestContext } from '../WebDAVRequest';
export default class implements HTTPMethod {
    unchunked(ctx: HTTPRequestContext, data: Buffer, callback: () => void): void;
}
