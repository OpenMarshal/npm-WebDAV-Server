/// <reference types="node" />
import { HTTPRequestContext, HTTPMethod } from '../WebDAVRequest';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
export interface IRange {
    min: number;
    max: number;
}
export declare function parseRangeHeader(mimeType: string, size: number, range: string): {
    ranges: IRange[];
    separator: any;
    len: number;
    createMultipart: (range: IRange) => string;
    endMultipart: () => string;
};
export default class implements HTTPMethod {
    unchunked(ctx: HTTPRequestContext, data: Buffer, callback: () => void): void;
    isValidFor(ctx: HTTPRequestContext, type: ResourceType): boolean;
}
