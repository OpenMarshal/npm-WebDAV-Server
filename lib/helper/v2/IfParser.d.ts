import { RequestContext } from '../../server/v2/RequestContext';
import { ReturnCallback } from '../../index.v2';
import { Resource } from '../../manager/v2/fileSystem/Resource';
export declare function extractOneToken(ifHeader: string): string;
export declare function parseIfHeader(ifHeader: string): (ctx: RequestContext, resource: Resource, callback: ReturnCallback<boolean>) => void;
