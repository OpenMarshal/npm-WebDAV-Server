"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = {
    BadAuthentication: new Error('Bad authentication'),
    AuenticationPropertyMissing: new Error('Properties are missing'),
    WrongHeaderFormat: new Error('Wrong header format'),
    MissingAuthorisationHeader: new Error('Missing Authorization header'),
    None: null
};
exports.default = exports.Errors;
