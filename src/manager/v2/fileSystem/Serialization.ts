import { Readable, Writable } from 'stream'
import { RequestContext } from '../../../server/v2/RequestContext'
import { XMLElement } from '../../../helper/XML'
import { LockScope } from '../../../resource/lock/LockScope'
import { LockType } from '../../../resource/lock/LockType'
import { LockKind } from '../../../resource/lock/LockKind'
import { Workflow } from '../../../helper/Workflow'
import { SerializerNotFound } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
import { Path } from '../Path'
import { ReturnCallback, SimpleCallback } from './CommonTypes'
import { FileSystem } from './FileSystem'
import * as mimeTypes from 'mime-types'
import * as crypto from 'crypto'

export interface ISerializableFileSystem
{
    serializer() : FileSystemSerializer;
    serialize(callback : ReturnCallback<any>) : void
}

export interface FileSystemSerializer
{
    uid() : string;
    serialize(fs : FileSystem, callback : ReturnCallback<any>) : void;
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
