import { IResource } from '../resource/IResource';
export interface ResourceTesterOptions {
    canHaveVirtualFolderChildren: boolean;
    canHaveVirtualFileChildren: boolean;
    canGetLastModifiedDate: boolean;
    canGetCreationDate: boolean;
    canRemoveChildren: boolean;
    canHaveChildren: boolean;
    canGetMimeType: boolean;
    canGetChildren: boolean;
    canBeCreated: boolean;
    canBeDeleted: boolean;
    canBeRenamed: boolean;
    canGetSize: boolean;
    canBeMoved: boolean;
    canWrite: boolean;
    canRead: boolean;
}
export declare type ResourceTesterTestCallback = (error: Error, isValid: boolean, text: string, optionReverse?: boolean, cbNext?: () => void) => void;
export declare type ResourceTesterProducerCallback<T> = (resource: T) => void;
export declare type ResourceTesterProducer<T> = (willCreate: boolean, callback: ResourceTesterProducerCallback<T>) => void;
export declare class ResourceTester<T extends IResource> {
    options: ResourceTesterOptions;
    producer: ResourceTesterProducer<T>;
    protected static uuid: number;
    constructor(options: ResourceTesterOptions, producer: ResourceTesterProducer<T>);
    protected multiple(callback: ResourceTesterTestCallback, nb: number): ResourceTesterTestCallback;
    run(callback: (results: any) => void): void;
    protected create(callback: ResourceTesterTestCallback): void;
    protected delete(callback: ResourceTesterTestCallback): void;
    protected moveTo(callback: ResourceTesterTestCallback): void;
    protected rename(callback: ResourceTesterTestCallback): void;
    protected writeRead(callback: ResourceTesterTestCallback): void;
    protected mimeType(callback: ResourceTesterTestCallback): void;
    protected size(callback: ResourceTesterTestCallback): void;
    protected addChild(callback: ResourceTesterTestCallback): void;
    protected removeChild(callback: ResourceTesterTestCallback): void;
    protected getChildren(callback: ResourceTesterTestCallback): void;
    protected setProperty(callback: ResourceTesterTestCallback): void;
    protected removeProperty(callback: ResourceTesterTestCallback): void;
    protected getProperties(callback: ResourceTesterTestCallback): void;
    protected creationDate(callback: ResourceTesterTestCallback): void;
    protected lastModifiedDate(callback: ResourceTesterTestCallback): void;
    protected webName(callback: ResourceTesterTestCallback): void;
    protected type(callback: ResourceTesterTestCallback): void;
}
