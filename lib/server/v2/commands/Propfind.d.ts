/// <reference types="node" />
import { HTTPRequestContext, HTTPMethod } from '../WebDAVRequest';
import { XMLElementBuilder } from 'xml-js-builder';
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes';
import { Resource } from '../../../manager/v2/fileSystem/Resource';
export default class implements HTTPMethod {
    addXMLInfo(ctx: HTTPRequestContext, data: Buffer, resource: Resource, multistatus: XMLElementBuilder, _callback: (e?: Error) => void): void;
    unchunked(ctx: HTTPRequestContext, data: Buffer, callback: () => void): void;
    isValidFor(ctx: HTTPRequestContext, type: ResourceType): boolean;
}
