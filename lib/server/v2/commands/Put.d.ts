/// <reference types="node" />
import { HTTPMethod, RequestContext } from '../WebDAVRequest';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
import { Readable } from 'stream';
export default class  implements HTTPMethod {
    isValidFor(type: ResourceType): boolean;
    chunked(ctx: RequestContext, inputStream: Readable, callback: () => void): void;
}
