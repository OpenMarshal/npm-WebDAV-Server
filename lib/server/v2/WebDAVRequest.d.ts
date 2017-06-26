/// <reference types="node" />
import { ResourceType } from '../../manager/v2/fileSystem/CommonTypes';
import { RequestContext } from './RequestContext';
import { Readable } from 'stream';
export { RequestContext } from './RequestContext';
export { HTTPCodes } from '../HTTPCodes';
export interface HTTPMethod {
    unchunked?(ctx: RequestContext, data: Buffer, callback: () => void): void;
    chunked?(ctx: RequestContext, inputStream: Readable, callback: () => void): void;
    isValidFor?(type?: ResourceType): boolean;
}
