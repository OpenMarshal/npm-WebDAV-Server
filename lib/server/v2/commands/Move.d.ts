/// <reference types="node" />
import { HTTPMethod, HTTPRequestContext } from '../WebDAVRequest';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
export declare function execute(ctx: HTTPRequestContext, methodName: string, privilegeName: string, callback: () => void): void;
export default class implements HTTPMethod {
    unchunked(ctx: HTTPRequestContext, data: Buffer, callback: () => void): void;
    isValidFor(ctx: HTTPRequestContext, type: ResourceType): boolean;
}
