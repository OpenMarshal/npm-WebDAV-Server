import { SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes';
import { FileSystemSerializer, SerializedData } from '../../../manager/v2/fileSystem/Serialization';
import { IAutoSave } from '../WebDAVServerOptions';
export declare function load(data: SerializedData, serializers: FileSystemSerializer[], callback: (error: Error) => void): void;
export declare function autoLoad(callback: SimpleCallback): void;
export declare function save(callback: (error: Error, obj: SerializedData) => void): void;
export declare function autoSave(options: IAutoSave): void;
