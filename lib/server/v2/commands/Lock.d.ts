/// <reference types="node" />
import { HTTPMethod, RequestContext } from '../WebDAVRequest';
export default class  implements HTTPMethod {
    unchunked(ctx: RequestContext, data: Buffer, callback: () => void): void;
}
