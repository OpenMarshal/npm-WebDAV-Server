"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimpleUser_1 = require("./SimpleUser");
var Errors_1 = require("../../../Errors");
var SimpleUserManager = /** @class */ (function () {
    function SimpleUserManager() {
        this.users = {
            __default: new SimpleUser_1.SimpleUser('DefaultUser', null, false, true)
        };
    }
    SimpleUserManager.prototype.getUserByName = function (name, callback) {
        if (!this.users[name])
            callback(Errors_1.Errors.UserNotFound, null);
        else
            callback(null, this.users[name]);
    };
    SimpleUserManager.prototype.getDefaultUser = function (callback) {
        callback(this.users.__default);
    };
    SimpleUserManager.prototype.addUser = function (name, password, isAdmin) {
        if (isAdmin === void 0) { isAdmin = false; }
        var user = new SimpleUser_1.SimpleUser(name, password, isAdmin, false);
        this.users[name] = user;
        return user;
    };
    SimpleUserManager.prototype.getUsers = function (callback) {
        var users = [];
        for (var name_1 in this.users)
            users.push(this.users[name_1]);
        callback(null, users);
    };
    return SimpleUserManager;
}());
exports.SimpleUserManager = SimpleUserManager;
