"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ManagerNotFound = (function (_super) {
    __extends(ManagerNotFound, _super);
    function ManagerNotFound(managerUID) {
        return _super.call(this, 'Cannot find the manager : ' + managerUID) || this;
    }
    return ManagerNotFound;
}(Error));
exports.ManagerNotFound = ManagerNotFound;
exports.Errors = {
    BadAuthentication: new Error('Bad authentication'),
    AuenticationPropertyMissing: new Error('Properties are missing'),
    WrongHeaderFormat: new Error('Wrong header format'),
    MissingAuthorisationHeader: new Error('Missing Authorization header'),
    UnrecognizedResource: new Error('Unrecognized resource'),
    ParentPropertiesMissing: new Error('The parent resource must have some special properties'),
    InvalidOperation: new Error('Invalid operation'),
    ResourceAlreadyExists: new Error('The resource already exists.'),
    ResourceNotFound: new Error('Can\'t find the resource.'),
    CannotLockResource: new Error('Can\'t lock the resource.'),
    PropertyNotFound: new Error('No property with such name.'),
    AlreadyAuthenticated: new Error('Already authenticated'),
    UserNotFound: new Error('User not found'),
    XMLNotFound: new Error('Can\'t find the XML element.'),
    None: null
};
exports.default = exports.Errors;
