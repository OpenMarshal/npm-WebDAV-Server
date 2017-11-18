import { ResourceType, ResourcePropertyValue, PropertyAttributes } from './CommonTypes';
import { RequestContext } from '../../../server/v2/RequestContext';
import { FileSystem } from './FileSystem';
import { Path } from '../Path';
export declare type IStorageManagerEvaluateCallback = (size: number) => void;
export interface IStorageManager {
    reserve(ctx: RequestContext, fs: FileSystem, size: number, callback: (reserved: boolean) => void): void;
    evaluateCreate(ctx: RequestContext, fs: FileSystem, path: Path, type: ResourceType, callback: IStorageManagerEvaluateCallback): void;
    evaluateContent(ctx: RequestContext, fs: FileSystem, expectedSize: number, callback: IStorageManagerEvaluateCallback): void;
    evaluateProperty(ctx: RequestContext, fs: FileSystem, name: string, value: ResourcePropertyValue, attributes: PropertyAttributes, callback: IStorageManagerEvaluateCallback): void;
    available(ctx: RequestContext, fs: FileSystem, callback: (available: number) => void): void;
    reserved(ctx: RequestContext, fs: FileSystem, callback: (reserved: number) => void): void;
}
export declare class NoStorageManager implements IStorageManager {
    reserve(ctx: RequestContext, fs: FileSystem, size: number, callback: (reserved: boolean) => void): void;
    evaluateCreate(ctx: RequestContext, fs: FileSystem, path: Path, type: ResourceType, callback: IStorageManagerEvaluateCallback): void;
    evaluateContent(ctx: RequestContext, fs: FileSystem, expectedSize: number, callback: IStorageManagerEvaluateCallback): void;
    evaluateProperty(ctx: RequestContext, fs: FileSystem, name: string, value: ResourcePropertyValue, attributes: PropertyAttributes, callback: IStorageManagerEvaluateCallback): void;
    available(ctx: RequestContext, fs: FileSystem, callback: (available: number) => void): void;
    reserved(ctx: RequestContext, fs: FileSystem, callback: (reserved: number) => void): void;
}
export declare class PerUserStorageManager implements IStorageManager {
    limitPerUser: number;
    storage: {
        [UUID: string]: number;
    };
    constructor(limitPerUser: number);
    reserve(ctx: RequestContext, fs: FileSystem, size: number, callback: (reserved: boolean) => void): void;
    evaluateCreate(ctx: RequestContext, fs: FileSystem, path: Path, type: ResourceType, callback: IStorageManagerEvaluateCallback): void;
    evaluateContent(ctx: RequestContext, fs: FileSystem, expectedSize: number, callback: IStorageManagerEvaluateCallback): void;
    evalPropValue(value: ResourcePropertyValue): number;
    evaluateProperty(ctx: RequestContext, fs: FileSystem, name: string, value: ResourcePropertyValue, attributes: PropertyAttributes, callback: IStorageManagerEvaluateCallback): void;
    available(ctx: RequestContext, fs: FileSystem, callback: (available: number) => void): void;
    reserved(ctx: RequestContext, fs: FileSystem, callback: (reserved: number) => void): void;
}
