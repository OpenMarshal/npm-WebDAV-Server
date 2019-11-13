"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonFunctions_1 = require("../../CommonFunctions");
var Errors_1 = require("../../../Errors");
var HTTPDigestAuthentication = /** @class */ (function () {
    function HTTPDigestAuthentication(realm, nonceSize) {
        if (realm === void 0) { realm = 'realm'; }
        if (nonceSize === void 0) { nonceSize = 50; }
        this.realm = realm;
        this.nonceSize = nonceSize;
    }
    HTTPDigestAuthentication.prototype.generateNonce = function () {
        var buffer = Buffer.alloc(this.nonceSize);
        for (var i = 0; i < buffer.length; ++i)
            buffer[i] = Math.floor(Math.random() * 256);
        return CommonFunctions_1.md5(buffer);
    };
    HTTPDigestAuthentication.prototype.askForAuthentication = function () {
        return {
            'WWW-Authenticate': 'Digest realm="' + this.realm + '", qop="auth,auth-int", nonce="' + this.generateNonce() + '", opaque="' + this.generateNonce() + '"'
        };
    };
    HTTPDigestAuthentication.prototype.getUser = function (arg, userManager, callback) {
        var _this = this;
        var onError = function (error) {
            userManager.getDefaultUser(function (defaultUser) {
                callback(error, defaultUser);
            });
        };
        var authHeader = arg.findHeader('Authorization');
        if (!authHeader)
            return onError(Errors_1.Errors.MissingAuthorisationHeader);
        var authProps;
        try {
            authProps = CommonFunctions_1.parseHTTPAuthHeader(authHeader, 'Digest');
        }
        catch (ex) {
            return onError(Errors_1.Errors.WrongHeaderFormat);
        }
        if (!(authProps.username && authProps.nonce && authProps.response))
            return onError(Errors_1.Errors.AuenticationPropertyMissing);
        if (!authProps.algorithm)
            authProps.algorithm = 'MD5';
        userManager.getUserByName(authProps.username, function (e, user) {
            if (e)
                return onError(e);
            var ha1 = CommonFunctions_1.md5(authProps.username + ':' + _this.realm + ':' + (user.password ? user.password : ''));
            if (authProps.algorithm === 'MD5-sess')
                ha1 = CommonFunctions_1.md5(ha1 + ':' + authProps.nonce + ':' + authProps.cnonce);
            var ha2;
            if (authProps.qop === 'auth-int')
                return onError(Errors_1.Errors.WrongHeaderFormat); // ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + ctx.requested.uri + ':' + md5(...));
            else
                ha2 = CommonFunctions_1.md5(arg.request.method.toString().toUpperCase() + ':' + arg.uri);
            var result;
            if (authProps.qop === 'auth-int' || authProps.qop === 'auth')
                result = CommonFunctions_1.md5(ha1 + ':' + authProps.nonce + ':' + authProps.nc + ':' + authProps.cnonce + ':' + authProps.qop + ':' + ha2);
            else
                result = CommonFunctions_1.md5(ha1 + ':' + authProps.nonce + ':' + ha2);
            if (result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors_1.Errors.None, user);
            else
                onError(Errors_1.Errors.BadAuthentication);
        });
    };
    return HTTPDigestAuthentication;
}());
exports.HTTPDigestAuthentication = HTTPDigestAuthentication;
