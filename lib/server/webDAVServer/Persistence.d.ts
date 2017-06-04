import { SerializedObject } from '../../manager/ISerializer';
import { FSManager } from '../../manager/FSManager';
export declare function load(obj: SerializedObject, managers: FSManager[], callback: (error: Error) => void): void;
export declare function save(callback: (error: Error, obj: any) => void): void;
