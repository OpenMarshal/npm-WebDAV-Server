"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimpleUser = /** @class */ (function () {
    function SimpleUser(username, password, isAdministrator, isDefaultUser) {
        this.username = username;
        this.password = password;
        this.isAdministrator = isAdministrator;
        this.isDefaultUser = isDefaultUser;
        this.uid = username;
    }
    return SimpleUser;
}());
exports.SimpleUser = SimpleUser;
