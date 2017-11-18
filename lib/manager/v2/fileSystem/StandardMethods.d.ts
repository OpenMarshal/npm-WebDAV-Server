import { ReturnCallback } from './CommonTypes';
import { RequestContext } from '../../../server/v2/RequestContext';
import { FileSystem } from './FileSystem';
import { Path } from '../Path';
export declare abstract class StandardMethods {
    static standardMove(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, callback: ReturnCallback<boolean>): void;
    static standardMove(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    static standardCopy(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, callback: ReturnCallback<boolean>): void;
    static standardCopy(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, depth: number, callback: ReturnCallback<boolean>): void;
    static standardCopy(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, overwrite: boolean, callback: ReturnCallback<boolean>): void;
    static standardCopy(ctx: RequestContext, subPathFrom: Path, fsFrom: FileSystem, subPathTo: Path, fsTo: FileSystem, overwrite: boolean, depth: number, callback: ReturnCallback<boolean>): void;
    static standardMimeType(ctx: RequestContext, fs: FileSystem, path: Path, targetSource: boolean, callback: ReturnCallback<string>): any;
    static standardMimeType(ctx: RequestContext, fs: FileSystem, path: Path, targetSource: boolean, useWebName: boolean, callback: ReturnCallback<string>): any;
    static standardMimeType(ctx: RequestContext, fs: FileSystem, path: Path, targetSource: boolean, defaultMimeType: string, callback: ReturnCallback<string>): any;
    static standardMimeType(ctx: RequestContext, fs: FileSystem, path: Path, targetSource: boolean, defaultMimeType: string, useWebName: boolean, callback: ReturnCallback<string>): any;
}
