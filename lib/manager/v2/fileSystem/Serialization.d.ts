import { ReturnCallback } from './CommonTypes';
import { FileSystem } from './FileSystem';
export interface ISerializableFileSystem {
    serializer(): FileSystemSerializer;
    serialize(callback: ReturnCallback<any>): void;
}
export interface FileSystemSerializer {
    uid(): string;
    serialize(fs: FileSystem, callback: ReturnCallback<any>): void;
    unserialize(serializedData: any, callback: ReturnCallback<FileSystem>): void;
}
export interface SerializedData {
    [path: string]: {
        serializer: string;
        data: any;
    };
}
export interface UnserializedData {
    [path: string]: FileSystem;
}
export declare function serialize(fileSystems: UnserializedData, callback: ReturnCallback<SerializedData>): void;
export declare function unserialize(serializedData: SerializedData, serializers: FileSystemSerializer[], callback: ReturnCallback<UnserializedData>): void;
