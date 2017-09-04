/// <reference types="node" />
import { XMLElement } from 'xml-js-builder';
export declare type SimpleCallback = (error?: Error) => void;
export declare type ReturnCallback<T> = (error?: Error, data?: T) => void;
export declare type Return2Callback<T1, T2> = (error?: Error, data1?: T1, data2?: T2) => void;
export declare type ResourcePropertyValue = string | XMLElement | XMLElement[];
export interface PropertyAttributes {
    [name: string]: string;
}
export declare class ResourceType {
    isFile: boolean;
    isDirectory: boolean;
    static File: ResourceType;
    static Directory: ResourceType;
    static Hybrid: ResourceType;
    static NoResource: ResourceType;
    constructor(isFile: boolean, isDirectory: boolean);
}
export declare type OpenWriteStreamMode = 'mustCreate' | 'canCreate' | 'mustExist' | 'canCreateIntermediates' | 'mustCreateIntermediates';
export interface SubTree {
    [name: string]: ResourceType | SubTree | string | Buffer;
}
