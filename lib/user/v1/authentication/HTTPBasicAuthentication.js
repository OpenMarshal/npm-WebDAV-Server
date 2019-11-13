"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var HTTPBasicAuthentication = /** @class */ (function () {
    function HTTPBasicAuthentication(realm) {
        if (realm === void 0) { realm = 'realm'; }
        this.realm = realm;
    }
    HTTPBasicAuthentication.prototype.askForAuthentication = function () {
        return {
            'WWW-Authenticate': 'Basic realm="' + this.realm + '"'
        };
    };
    HTTPBasicAuthentication.prototype.getUser = function (arg, userManager, callback) {
        var onError = function (error) {
            userManager.getDefaultUser(function (defaultUser) {
                callback(error, defaultUser);
            });
        };
        var authHeader = arg.findHeader('Authorization');
        if (!authHeader) {
            onError(Errors_1.Errors.MissingAuthorisationHeader);
            return;
        }
        if (!/^Basic \s*[a-zA-Z0-9]+=*\s*$/.test(authHeader)) {
            onError(Errors_1.Errors.WrongHeaderFormat);
            return;
        }
        var value = /^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(authHeader)[1];
        userManager.getUsers(function (e, users) {
            if (e) {
                onError(e);
                return;
            }
            for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
                var user = users_1[_i];
                var expected = Buffer.from(user.username + ':' + (user.password ? user.password : '')).toString('base64');
                if (value === expected) {
                    callback(Errors_1.Errors.None, user);
                    return;
                }
            }
            onError(Errors_1.Errors.BadAuthentication);
        });
    };
    return HTTPBasicAuthentication;
}());
exports.HTTPBasicAuthentication = HTTPBasicAuthentication;
