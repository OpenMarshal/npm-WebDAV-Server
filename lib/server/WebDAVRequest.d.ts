/// <reference types="node" />
import { MethodCallArgs } from './MethodCallArgs';
import { HTTPError } from '../Errors';
export { MethodCallArgs } from './MethodCallArgs';
export { HTTPCodes } from './HTTPCodes';
export declare type ChunkOnDataCallback = (chunk: Buffer, isFirst: boolean, isLast: boolean) => void;
export declare type StartChunkedCallback = (error: HTTPError, onData: ChunkOnDataCallback) => void;
export interface WebDAVRequest {
    (arg: MethodCallArgs, callback: () => void): void;
    startChunked?: (arg: MethodCallArgs, callback: StartChunkedCallback) => void;
}
