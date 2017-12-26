import { SerializedObject } from '../../../manager/v1/ISerializer';
import { SimpleCallback } from '../../../resource/v1/IResource';
import { FSManager } from '../../../manager/v1/FSManager';
export declare function load(obj: SerializedObject, managers: FSManager[], callback: (error: Error) => void): void;
export declare function autoLoad(callback: SimpleCallback): void;
export declare function save(callback: (error: Error, obj: any) => void): void;
