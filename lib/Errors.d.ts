export declare class ManagerNotFound extends Error {
    constructor(managerUID: string);
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
    None: any;
};
export default Errors;
