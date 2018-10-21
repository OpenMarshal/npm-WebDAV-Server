import { FileSystemSerializer, SerializedData } from '../../../manager/v2/fileSystem/Serialization';
import { IAutoSave } from '../WebDAVServerOptions';
import { SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes';
export declare function load(data: SerializedData, serializers: FileSystemSerializer[], callback: (error: Error) => void): void;
export declare function autoLoad(callback: SimpleCallback): void;
export declare function save(callback: (error: Error, obj: SerializedData) => void): void;
export declare class AutoSavePool {
    constructor(options: IAutoSave, saveFn: (callback: (error: Error, data: any) => void) => void);
    protected saveFn: (callback: (error: Error, data: any) => void) => void;
    protected saveRequested: boolean;
    protected saving: boolean;
    protected options: IAutoSave;
    imediateSave(): void;
    save(): void;
    protected saveIfNext(): void;
}
export declare function autoSave(options: IAutoSave): void;
