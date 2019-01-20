"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var LocalPropertyManager = /** @class */ (function () {
    function LocalPropertyManager(serializedData) {
        this.properties = {};
        if (serializedData)
            for (var name_1 in serializedData)
                this[name_1] = serializedData[name_1];
    }
    LocalPropertyManager.prototype.setProperty = function (name, value, attributes, callback) {
        this.properties[name] = {
            value: value,
            attributes: attributes
        };
        callback(null);
    };
    LocalPropertyManager.prototype.getProperty = function (name, callback) {
        var property = this.properties[name];
        callback(property ? null : Errors_1.Errors.PropertyNotFound, property.value, property.attributes);
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
