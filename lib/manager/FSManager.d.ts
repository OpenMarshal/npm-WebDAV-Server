import { IResource } from '../resource/Resource';
export interface FSManager {
    serialize(resource: IResource): object;
    unserialize(serializedResource: object): IResource;
}
export declare class FSPath {
}
