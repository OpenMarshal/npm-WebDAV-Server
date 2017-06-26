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
            'WWW-Authenticate': 'Digest realm="' + this.realm + '", qop="auth,auth-int", nonce="' + this.generateNonce() + '", opaque="' + this.generateNonce() + '"'
        };
    };
    HTTPDigestAuthentication.prototype.getUser = function (arg, callback) {
        var _this = this;
        var onError = function (error) {
            _this.userManager.getDefaultUser(function (defaultUser) {
                callback(error, defaultUser);
            });
        };
        var authHeader = arg.headers.find('Authorization');
        if (!authHeader) {
            onError(Errors_1.Errors.MissingAuthorisationHeader);
            return;
        }
        if (!/^Digest (\s*[a-zA-Z]+\s*=\s*(("(\\"|[^"])+")|([^,\s]+))\s*(,|$))+$/.test(authHeader)) {
            onError(Errors_1.Errors.WrongHeaderFormat);
            return;
        }
        authHeader = authHeader.substring(authHeader.indexOf(' ') + 1); // remove the authentication type from the string
        var authProps = {};
        var rex = /([a-zA-Z]+)\s*=\s*(?:(?:"((?:\\"|[^"])+)")|([^,\s]+))/g;
        var match = rex.exec(authHeader);
        while (match) {
            authProps[match[1]] = match[3] ? match[3] : match[2];
            match = rex.exec(authHeader);
        }
        if (!(authProps.username && authProps.nonce && authProps.nc && authProps.cnonce && authProps.qop && authProps.response)) {
            onError(Errors_1.Errors.AuenticationPropertyMissing);
            return;
        }
        this.userManager.getUserByName(authProps.username, function (e, user) {
            if (e) {
                onError(e);
                return;
            }
            var ha1 = md5(authProps.username + ':' + _this.realm + ':' + (user.password ? user.password : ''));
            var ha2 = md5(arg.request.method.toString().toUpperCase() + ':' + arg.requested.uri);
            var result = md5(ha1 + ':' + authProps.nonce + ':' + authProps.nc + ':' + authProps.cnonce + ':' + authProps.qop + ':' + ha2);
            if (result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors_1.Errors.None, user);
            else
                onError(Errors_1.Errors.BadAuthentication);
        });
    };
    return HTTPDigestAuthentication;
}());
exports.HTTPDigestAuthentication = HTTPDigestAuthentication;
