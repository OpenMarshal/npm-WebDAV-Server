"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ManagerNotFound = /** @class */ (function (_super) {
    __extends(ManagerNotFound, _super);
    function ManagerNotFound(managerUID) {
        var _this = _super.call(this, 'Cannot find the manager : ' + managerUID) || this;
        _this.managerUID = managerUID;
        return _this;
    }
    return ManagerNotFound;
}(Error));
exports.ManagerNotFound = ManagerNotFound;
var SerializerNotFound = /** @class */ (function (_super) {
    __extends(SerializerNotFound, _super);
    function SerializerNotFound(serializerUID) {
        var _this = _super.call(this, 'Cannot find the serializer : ' + serializerUID) || this;
        _this.serializerUID = serializerUID;
        return _this;
    }
    return SerializerNotFound;
}(Error));
exports.SerializerNotFound = SerializerNotFound;
var HTTPError = /** @class */ (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(HTTPCode, inheritedError) {
        var _this = _super.call(this, 'Error ' + HTTPCode) || this;
        _this.HTTPCode = HTTPCode;
        _this.inheritedError = inheritedError;
        return _this;
    }
    return HTTPError;
}(Error));
exports.HTTPError = HTTPError;
var AuthenticationPropertyMissing = new Error('Properties are missing.');
exports.Errors = {
    BadAuthentication: new Error('Bad authentication.'),
    AuenticationPropertyMissing: AuthenticationPropertyMissing,
    AuthenticationPropertyMissing: AuthenticationPropertyMissing,
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
exports.default = exports.Errors;
