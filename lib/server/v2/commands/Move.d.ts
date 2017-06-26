/// <reference types="node" />
import { HTTPMethod, RequestContext } from '../WebDAVRequest';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
export declare function execute(ctx: RequestContext, methodName: string, privilegeName: string, callback: () => void): void;
export default class  implements HTTPMethod {
    unchunked(ctx: RequestContext, data: Buffer, callback: () => void): void;
    isValidFor(type: ResourceType): boolean;
}
