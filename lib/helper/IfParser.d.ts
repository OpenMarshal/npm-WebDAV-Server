import { IResource, ReturnCallback } from '../resource/IResource';
import { MethodCallArgs } from '../server/MethodCallArgs';
export declare function extractOneToken(ifHeader: string): string;
export declare function parseIfHeader(ifHeader: string): (arg: MethodCallArgs, r: IResource, callback: ReturnCallback<boolean>) => void;
