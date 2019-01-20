/// <reference types="node" />
import { HTTPMethod, HTTPRequestContext } from '../WebDAVRequest';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
import { Readable } from 'stream';
export default class implements HTTPMethod {
    isValidFor(ctx: HTTPRequestContext, type: ResourceType): boolean;
    chunked(ctx: HTTPRequestContext, inputStream: Readable, callback: () => void): void;
}
