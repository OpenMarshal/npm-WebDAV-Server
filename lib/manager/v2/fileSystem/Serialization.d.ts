import { ReturnCallback } from './CommonTypes';
import { FileSystem } from './FileSystem';
export interface ISerializableFileSystem {
    serializer(): FileSystemSerializer;
    serialize(callback: ReturnCallback<any>): void;
}
/**
 * File system serializer to un/serialize file systems.
 *
 * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Persistence-%5Bv2%5D
 */
export interface FileSystemSerializer {
    /**
     * Uniquely identify the file system.
     *
     * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Persistence-%5Bv2%5D#unique-identifier
     */
    uid(): string;
    /**
     * Serialize a file system into an object.
     *
     * @param fs File system to serialize.
     * @param callback Returns the serialized data.
     */
    serialize(fs: FileSystem, callback: ReturnCallback<any>): void;
    /**
     * Unserialize data into a file system.
     *
     * @param serializedData Previously serialized data.
     * @param callback Returns the unserialized file system.
     */
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
