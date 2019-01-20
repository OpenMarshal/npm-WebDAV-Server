export declare class ManagerNotFound extends Error {
    managerUID: string;
    constructor(managerUID: string);
}
export declare class SerializerNotFound extends Error {
    serializerUID: string;
    constructor(serializerUID: string);
}
export declare class HTTPError extends Error {
    HTTPCode: number;
    inheritedError?: Error;
    constructor(HTTPCode: number, inheritedError?: Error);
}
export declare const Errors: {
    BadAuthentication: Error;
    AuenticationPropertyMissing: Error;
    AuthenticationPropertyMissing: Error;
    WrongHeaderFormat: Error;
    MissingAuthorisationHeader: Error;
    UnrecognizedResource: Error;
    ParentPropertiesMissing: Error;
    InvalidOperation: Error;
    ResourceAlreadyExists: Error;
    ResourceNotFound: Error;
    CannotLockResource: Error;
    PropertyNotFound: Error;
    AlreadyAuthenticated: Error;
    UserNotFound: Error;
    XMLNotFound: Error;
    ExpectedAFileResourceType: Error;
    NoMimeTypeForAFolder: Error;
    NoSizeForAFolder: Error;
    IllegalArguments: Error;
    MustIgnore: Error;
    Locked: Error;
    InsufficientStorage: Error;
    IntermediateResourceMissing: Error;
    WrongParentTypeForCreation: Error;
    NotEnoughPrivilege: Error;
    Forbidden: Error;
    None: any;
};
export default Errors;
