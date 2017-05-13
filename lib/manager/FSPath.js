"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FSPath = (function () {
    function FSPath(path) {
        if (path.constructor === String)
            this.paths = path.replace(/(^\/|\/$)/g, '').split('/');
        else if (path.constructor === FSPath)
            this.paths = path.paths.filter(function (x) { return true; });
        else
            this.paths = path;
    }
    FSPath.prototype.isRoot = function () {
        return this.paths.length === 0 || this.paths.length === 1 && this.paths[0].length === 0;
    };
    FSPath.prototype.fileName = function () {
        return this.paths[this.paths.length - 1];
    };
    FSPath.prototype.rootName = function () {
        return this.paths[0];
    };
    FSPath.prototype.parentName = function () {
        return this.paths[this.paths.length - 2];
    };
    FSPath.prototype.getParent = function () {
        return new FSPath(this.paths.slice(0, this.paths.length - 1));
    };
    FSPath.prototype.hasParent = function () {
        return this.paths.length >= 2;
    };
    FSPath.prototype.removeRoot = function () {
        this.paths.splice(0, 1);
    };
    FSPath.prototype.clone = function () {
        return new FSPath(this);
    };
    FSPath.prototype.toString = function () {
        return '/' + this.paths.join('/');
    };
    return FSPath;
}());
exports.FSPath = FSPath;
