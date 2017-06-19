export declare class ManagerNotFound extends Error {
    managerUID: string;
    constructor(managerUID: string);
}
export declare class HTTPError extends Error {
    HTTPCode: number;
    inheritedError: Error;
    constructor(HTTPCode: number, inheritedError?: Error);
}
export declare const Errors: {
    BadAuthentication: Error;
    AuenticationPropertyMissing: Error;
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
    None: any;
};
export default Errors;
