import { IResource, ReturnCallback } from '../../resource/v1/IResource';
import { MethodCallArgs } from '../../server/v1/MethodCallArgs';
export declare function extractOneToken(ifHeader: string): string;
export declare function parseIfHeader(ifHeader: string): (arg: MethodCallArgs, r: IResource, callback: ReturnCallback<boolean>) => void;
