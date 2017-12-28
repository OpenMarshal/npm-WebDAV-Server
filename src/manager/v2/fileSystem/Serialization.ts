import { SerializerNotFound } from '../../../Errors'
import { ReturnCallback } from './CommonTypes'
import { FileSystem } from './FileSystem'
import { Workflow } from '../../../helper/Workflow'

export interface ISerializableFileSystem
{
    serializer() : FileSystemSerializer;
    serialize(callback : ReturnCallback<any>) : void
}

/**
 * File system serializer to un/serialize file systems.
 * 
 * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Persistence-%5Bv2%5D
 */
export interface FileSystemSerializer
{
    /**
     * Uniquely identify the file system.
     * 
     * @see https://github.com/OpenMarshal/npm-WebDAV-Server/wiki/Persistence-%5Bv2%5D#unique-identifier
     */
    uid() : string;

    /**
     * Serialize a file system into an object.
     * 
     * @param fs File system to serialize.
     * @param callback Returns the serialized data.
     */
    serialize(fs : FileSystem, callback : ReturnCallback<any>) : void;

    /**
     * Unserialize data into a file system.
     * 
     * @param serializedData Previously serialized data.
     * @param callback Returns the unserialized file system.
     */
    unserialize(serializedData : any, callback : ReturnCallback<FileSystem>) : void;
}

export interface SerializedData
{
    [path : string] : {
        serializer : string
        data : any
    }
}
export interface UnserializedData
{
    [path : string] : FileSystem
}
export function serialize(fileSystems : UnserializedData, callback : ReturnCallback<SerializedData>)
{
    const result : SerializedData = {};
    new Workflow()
        .each(Object.keys(fileSystems), (path, cb) => {
            const fs = fileSystems[path];
            const serializer = fs.serializer();
            if(!serializer)
                return cb(); // Skip serialization
            
            serializer.serialize(fs, (e, data) => {
                if(!e)
                    result[path] = {
                        serializer: serializer.uid(),
                        data
                    };
                cb(e)
            });
        })
        .error(callback)
        .done(() => callback(null, result));
}

export function unserialize(serializedData : SerializedData, serializers : FileSystemSerializer[], callback : ReturnCallback<UnserializedData>)
{
    const result : UnserializedData = {};

    new Workflow()
        .each(Object.keys(serializedData), (path, cb) => {
            const sd = serializedData[path];
            let serializer : FileSystemSerializer = null;
            for(const s of serializers)
                if(s.uid() === sd.serializer)
                {
                    serializer = s;
                    break;
                }
            
            if(!serializer)
                return cb(new SerializerNotFound(sd.serializer));
            
            serializer.unserialize(sd.data, (e, fs) => {
                if(!e)
                    result[path] = fs;
                cb(e);
            })
        })
        .error(callback)
        .done(() => callback(null, result));
}
