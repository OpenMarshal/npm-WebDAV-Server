"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NoStorageManager = /** @class */ (function () {
    function NoStorageManager() {
    }
    NoStorageManager.prototype.reserve = function (ctx, fs, size, callback) {
        callback(true);
    };
    NoStorageManager.prototype.evaluateCreate = function (ctx, fs, path, type, callback) {
        callback(0);
    };
    NoStorageManager.prototype.evaluateContent = function (ctx, fs, expectedSize, callback) {
        callback(0);
    };
    NoStorageManager.prototype.evaluateProperty = function (ctx, fs, name, value, attributes, callback) {
        callback(0);
    };
    NoStorageManager.prototype.available = function (ctx, fs, callback) {
        callback(-1);
    };
    NoStorageManager.prototype.reserved = function (ctx, fs, callback) {
        callback(0);
    };
    return NoStorageManager;
}());
exports.NoStorageManager = NoStorageManager;
var PerUserStorageManager = /** @class */ (function () {
    function PerUserStorageManager(limitPerUser) {
        this.limitPerUser = limitPerUser;
        this.storage = {};
    }
    PerUserStorageManager.prototype.reserve = function (ctx, fs, size, callback) {
        var nb = this.storage[ctx.user.uid];
        if (nb === undefined)
            nb = 0;
        nb += size;
        if (nb > this.limitPerUser)
            return callback(false);
        this.storage[ctx.user.uid] = Math.max(0, nb);
        callback(true);
    };
    PerUserStorageManager.prototype.evaluateCreate = function (ctx, fs, path, type, callback) {
        fs.getFullPath(ctx, path, function (e, fullPath) {
            callback(fullPath.toString().length);
        });
    };
    PerUserStorageManager.prototype.evaluateContent = function (ctx, fs, expectedSize, callback) {
        callback(expectedSize);
    };
    PerUserStorageManager.prototype.evalPropValue = function (value) {
        var _this = this;
        if (!value)
            return 0;
        if (value.constructor === String)
            return value.length;
        if (Array.isArray(value))
            return value.map(function (el) { return _this.evalPropValue(el); }).reduce(function (p, n) { return p + n; }, 0);
        var xml = value;
        var attributesLength = Object.keys(xml.attributes).map(function (at) { return at.length + xml.attributes[at].length; }).reduce(function (p, n) { return p + n; }, 0);
        // tslint:disable-next-line:restrict-plus-operands
        return xml.name.length + attributesLength + (xml.elements && xml.elements.length > 0 ? this.evalPropValue(xml.elements) : 0);
    };
    PerUserStorageManager.prototype.evaluateProperty = function (ctx, fs, name, value, attributes, callback) {
        callback(name.length + Object.keys(attributes).map(function (ak) { return attributes[ak].length + ak.length; }).reduce(function (p, n) { return p + n; }, 0) + this.evalPropValue(value));
    };
    PerUserStorageManager.prototype.available = function (ctx, fs, callback) {
        var nb = this.storage[ctx.user.uid];
        callback(nb === undefined ? this.limitPerUser : this.limitPerUser - nb);
    };
    PerUserStorageManager.prototype.reserved = function (ctx, fs, callback) {
        var nb = this.storage[ctx.user.uid];
        callback(nb === undefined ? 0 : nb);
    };
    return PerUserStorageManager;
}());
exports.PerUserStorageManager = PerUserStorageManager;
