"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var crypto = require("crypto");
function md5(value) {
    return crypto.createHash('md5').update(value).digest('hex');
}
function parseHeader(authHeader, prefix) {
    var stepOverSeparator = function (currentString, index, separator) {
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        if (currentString.length <= index || currentString[index] !== separator)
            throw new Error('Invalid format');
        ++index;
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        if (currentString.length <= index)
            throw new Error('Invalid format');
        return index;
    };
    var getToken = function (currentString) {
        var index = 0;
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        var match = /^([a-zA-Z]+)/.exec(currentString.substring(index));
        var key = match[1];
        index += key.length;
        index = stepOverSeparator(currentString, index, '=');
        var value;
        if (currentString[index] === '"') {
            ++index;
            value = '';
            var startIndex = index;
            while (currentString.length > index && currentString[index] !== '"') {
                if (currentString[index] === '\\')
                    ++index;
                value += currentString[index];
                ++index;
            }
            ++index;
        }
        else {
            var match2 = /^([^\s,]+)/.exec(currentString.substring(index));
            value = match2[1];
            index += value.length;
        }
        return {
            strLeft: currentString.substring(index),
            key: key,
            value: value
        };
    };
    if (authHeader.indexOf(prefix + ' ') !== 0)
        throw Error('Invalid format');
    authHeader = authHeader.substring((prefix + ' ').length);
    var keyValues = {};
    var token;
    do {
        token = getToken(authHeader);
        if (token) {
            keyValues[token.key] = token.value;
            authHeader = token.strLeft.trim();
            if (authHeader.length > 0)
                authHeader = authHeader.substring(stepOverSeparator(authHeader, 0, ','));
        }
    } while (token && authHeader);
    return keyValues;
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
            'WWW-Authenticate': "Digest realm=\"" + this.realm + "\", qop=\"auth\", nonce=\"" + this.generateNonce() + "\", opaque=\"" + this.generateNonce() + "\""
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
        var authProps;
        try {
            authProps = parseHeader(authHeader, 'Digest');
        }
        catch (ex) {
            return onError(Errors_1.Errors.WrongHeaderFormat);
        }
        if (!(authProps.username && authProps.nonce && authProps.response))
            return onError(Errors_1.Errors.AuenticationPropertyMissing);
        if (!authProps.algorithm)
            authProps.algorithm = 'MD5';
        this.userManager.getUserByName(authProps.username, function (e, user) {
            if (e)
                return onError(e);
            var ha1 = md5(authProps.username + ":" + _this.realm + ":" + (user.password ? user.password : ''));
            if (authProps.algorithm === 'MD5-sess')
                ha1 = md5(ha1 + ":" + authProps.nonce + ":" + authProps.cnonce);
            var ha2;
            if (authProps.qop === 'auth-int')
                return onError(Errors_1.Errors.WrongHeaderFormat); // ha2 = md5(ctx.request.method.toString().toUpperCase() + ':' + ctx.requested.uri + ':' + md5(...));
            else
                ha2 = md5(ctx.request.method.toString().toUpperCase() + ":" + ctx.requested.uri);
            var result;
            if (authProps.qop === 'auth-int' || authProps.qop === 'auth')
                result = md5(ha1 + ":" + authProps.nonce + ":" + authProps.nc + ":" + authProps.cnonce + ":" + authProps.qop + ":" + ha2);
            else
                result = md5(ha1 + ":" + authProps.nonce + ":" + ha2);
            if (result.toLowerCase() === authProps.response.toLowerCase())
                callback(Errors_1.Errors.None, user);
            else
                onError(Errors_1.Errors.BadAuthentication);
        });
    };
    return HTTPDigestAuthentication;
}());
exports.HTTPDigestAuthentication = HTTPDigestAuthentication;
