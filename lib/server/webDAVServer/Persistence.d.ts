import { SerializedObject } from '../../manager/ISerializer';
import { SimpleCallback } from '../../resource/IResource';
import { FSManager } from '../../manager/FSManager';
export declare function load(obj: SerializedObject, managers: FSManager[], callback: (error: Error) => void): void;
export declare function autoLoad(callback: SimpleCallback): void;
export declare function save(callback: (error: Error, obj: any) => void): void;
