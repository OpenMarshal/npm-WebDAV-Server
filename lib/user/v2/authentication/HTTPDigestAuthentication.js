"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var crypto = require("crypto");
function md5(value) {
    return crypto.createHash('md5').update(value).digest('hex');
}
var HTTPDigestAuthentication = (function () {
    function HTTPDigestAuthentication(userManager, realm, nonceSize) {
        if (realm === void 0) { realm = 'realm'; }
        if (nonceSize === void 0) { nonceSize = 50; }
        this.userManager = userManager;
        this.realm = realm;
        this.nonceSize = nonceSize;
    }
    HTTPDigestAuthentication.prototype.generateNonce = function () {
        var buffer = new Buffer(this.nonceSize);
        for (var i = 0; i < buffer.length; ++i)
            buffer[i] = Math.ceil(Math.random() * 256);
        return md5(buffer);
    };
    HTTPDigestAuthentication.prototype.askForAuthentication = function () {
        return {
            'WWW-Authenticate': 'Digest realm="' + this.realm + '", qop="auth", nonce="' + this.generateNonce() + '", opaque="' + this.generateNonce() + '"'
        };
    };
    HTTPDigestAuthentication.prototype.getUser = function (ctx, callback) {
        var _this = this;
        var onError = function (error) {
            _this.userManager.getDefaultUser(function (defaultUser) {
                callback(error, defaultUser);
            });
        };
        var authHeader = ctx.headers.find('Authorization');
        if (!authHeader)
            return onError(Errors_1.Errors.MissingAuthorisationHeader);
        if (!/^Digest (\s*[a-zA-Z]+\s*=\s*(("(\\"|[^"])+")|([^,\s]+))?\s*(,|$))+$/.test(authHeader))
            return onError(Errors_1.Errors.WrongHeaderFormat);
        authHeader = authHeader.substring(authHeader.indexOf(' ') + 1); // remove the authentication type from the string
        var authProps = {};
        var rex = /([a-zA-Z]+)\s*=\s*(?:(?:"((?:\\"|[^"])+)")|([^,\s]+))/g;
        var match = rex.exec(authHeader);
        while (match) {
            authProps[match[1]] = match[3] ? match[3] : match[2];
            match = rex.exec(authHeader);
        }
        if (!(authProps.username && authProps.nonce && authProps.response))
            return onError(Errors_1.Errors.AuenticationPropertyMissing);
        if (!authProps.algorithm)
            authProps.algorithm = 'MD5';
        this.userManager.getUserByName(authProps.username, function (e, user) {
            if (e)
                return onError(e);
            var ha1 = md5(authProps.username + ':' + _this.realm + ':' + (user.password ? user.password : ''));
            if (authProps.algorithm === 'MD5-sess')
                ha1 = md5(ha1 + ':' + authProps.nonce + ':' + authProps.cnonce);
            var ha2;
            if (authProps.qop === 'auth-int')
                return onError(Errors_1.Errors.WrongHeaderFormat); // ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + ctx.requested.uri + ':' + md5(...));
            else
                ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + ctx.requested.uri);
            var result;
            if (authProps.qop === 'auth-int' || authProps.qop === 'auth')
                result = md5(ha1 + ':' + authProps.nonce + ':' + authProps.nc + ':' + authProps.cnonce + ':' + authProps.qop + ':' + ha2);
            else
                result = md5(ha1 + ':' + authProps.nonce + ':' + ha2);
            if (result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors_1.Errors.None, user);
            else
                onError(Errors_1.Errors.BadAuthentication);
        });
    };
    return HTTPDigestAuthentication;
}());
exports.HTTPDigestAuthentication = HTTPDigestAuthentication;
