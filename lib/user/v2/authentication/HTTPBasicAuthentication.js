"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var HTTPBasicAuthentication = /** @class */ (function () {
    function HTTPBasicAuthentication(userManager, realm) {
        if (realm === void 0) { realm = 'realm'; }
        this.userManager = userManager;
        this.realm = realm;
    }
    HTTPBasicAuthentication.prototype.askForAuthentication = function (ctx) {
        return {
            'WWW-Authenticate': 'Basic realm="' + this.realm + '"'
        };
    };
    HTTPBasicAuthentication.prototype.getUser = function (ctx, callback) {
        var _this = this;
        var onError = function (error) {
            _this.userManager.getDefaultUser(function (defaultUser) {
                callback(error, defaultUser);
            });
        };
        var authHeader = ctx.headers.find('Authorization');
        if (!authHeader) {
            onError(Errors_1.Errors.MissingAuthorisationHeader);
            return;
        }
        if (!/^Basic \s*[a-zA-Z0-9]+=*\s*$/.test(authHeader)) {
            onError(Errors_1.Errors.WrongHeaderFormat);
            return;
        }
        var value = Buffer.from(/^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(authHeader)[1], 'base64').toString().split(':', 2);
        var username = value[0];
        var password = value[1];
        this.userManager.getUserByNamePassword(username, password, function (e, user) {
            if (e)
                onError(Errors_1.Errors.BadAuthentication);
            else
                callback(null, user);
        });
    };
    return HTTPBasicAuthentication;
}());
exports.HTTPBasicAuthentication = HTTPBasicAuthentication;
