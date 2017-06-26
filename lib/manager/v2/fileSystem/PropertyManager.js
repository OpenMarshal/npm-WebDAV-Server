"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var LocalPropertyManager = (function () {
    function LocalPropertyManager() {
        this.properties = {};
    }
    LocalPropertyManager.prototype.setProperty = function (name, value, callback) {
        this.properties[name] = value;
        callback(null);
    };
    LocalPropertyManager.prototype.getProperty = function (name, callback) {
        var property = this.properties[name];
        callback(property ? null : Errors_1.Errors.PropertyNotFound, property);
    };
    LocalPropertyManager.prototype.removeProperty = function (name, callback) {
        delete this.properties[name];
        callback(null);
    };
    LocalPropertyManager.prototype.getProperties = function (callback, byCopy) {
        if (byCopy === void 0) { byCopy = false; }
        callback(null, byCopy ? this.properties : JSON.parse(JSON.stringify(this.properties)));
    };
    return LocalPropertyManager;
}());
exports.LocalPropertyManager = LocalPropertyManager;
