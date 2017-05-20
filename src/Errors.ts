
export const Errors = {
    BadAuthentication: new Error('Bad authentication'),
    AuenticationPropertyMissing: new Error('Properties are missing'),
    WrongHeaderFormat: new Error('Wrong header format'),
    MissingAuthorisationHeader: new Error('Missing Authorization header'),
    
    None: null
};

export default Errors;
