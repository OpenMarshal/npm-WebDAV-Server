
export interface ResourceTesterOptions
{
    canHaveVirtualFolderChildren : boolean
    canHaveVirtualFileChildren : boolean
    canGetLastModifiedDate : boolean
    canGetCreationDate : boolean
    canRemoveChildren : boolean
    canHaveChildren : boolean
    canGetMimeType : boolean
    canGetChildren : boolean
    canBeCreated : boolean
    canBeDeleted : boolean
    canBeRenamed : boolean
    canGetSize : boolean
    canBeMoved : boolean
    canWrite : boolean
    canRead : boolean
    canLock : boolean
}

export type ResourceTesterTestCallback = (error : Error, isValid : boolean, text : string, optionReverse ?: boolean, cbNext ?: () => void) => void;
export type ResourceTesterProducerCallback<T> = (resource : T) => void;
export type ResourceTesterProducer<T> = (willCreate : boolean, callback : ResourceTesterProducerCallback<T>) => void;
