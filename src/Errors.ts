
export class ManagerNotFound extends Error
{
    constructor(public managerUID : string)
    {
        super('Cannot find the manager : ' + managerUID);
    }
}

export class SerializerNotFound extends Error
{
    constructor(public serializerUID : string)
    {
        super('Cannot find the serializer : ' + serializerUID);
    }
}

export class HTTPError extends Error
{
    constructor(public HTTPCode : number, public inheritedError ?: Error)
    {
        super('Error ' + HTTPCode)
    }
}

const AuthenticationPropertyMissing = new Error('Properties are missing.');

export const Errors = {
    BadAuthentication: new Error('Bad authentication.'),
    AuenticationPropertyMissing: AuthenticationPropertyMissing, // Bad synthax
    AuthenticationPropertyMissing,
    WrongHeaderFormat: new Error('Wrong header format.'),
    MissingAuthorisationHeader: new Error('Missing Authorization header.'),
    UnrecognizedResource: new Error('Unrecognized resource.'),
    ParentPropertiesMissing: new Error('The parent resource must have some special properties.'),
    InvalidOperation: new Error('Invalid operation.'),
    ResourceAlreadyExists: new Error('The resource already exists.'),
    ResourceNotFound: new Error('Can\'t find the resource.'),
    CannotLockResource: new Error('Can\'t lock the resource.'),
    PropertyNotFound: new Error('No property with such name.'),
    AlreadyAuthenticated: new Error('Already authenticated.'),
    UserNotFound: new Error('User not found.'),
    XMLNotFound: new Error('Can\'t find the XML element : '),
    ExpectedAFileResourceType: new Error('Expected a file resource type.'),
    NoMimeTypeForAFolder: new Error('Cannot get the mime type of a folder type resource.'),
    NoSizeForAFolder: new Error('Cannot get the size of a folder type resource.'),
    IllegalArguments: new Error('Illegal arguments.'),
    MustIgnore: new Error('There was an error but it must not stop the processing.'),
    Locked: new Error('The resource is locked, operation forbidden.'),
    InsufficientStorage: new Error('Insufficient storage space.'),
    IntermediateResourceMissing: new Error('One or more intermediate resources are missing for this operation.'),
    WrongParentTypeForCreation: new Error('Cannot create a child resource to a non directory resource.'),
    NotEnoughPrivilege: new Error('Not enough privilege.'),
    Forbidden: new Error('Forbidden operation.'),

    None: null
};

export default Errors;
