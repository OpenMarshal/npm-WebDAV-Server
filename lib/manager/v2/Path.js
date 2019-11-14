"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = /** @class */ (function () {
    function Path(path) {
        if (path.constructor === String) {
            var sPath = path;
            var doubleIndex = void 0;
            while ((doubleIndex = sPath.indexOf('//')) !== -1)
                sPath = sPath.substr(0, doubleIndex) + sPath.substr(doubleIndex + 1);
            this.paths = sPath.replace(/(^\/|\/$)/g, '').split('/');
        }
        else if (path.constructor === Path)
            this.paths = path.paths.filter(function (x) { return true; }); // clone
        else
            this.paths = path;
        this.paths = this.paths.filter(function (p) { return p.length > 0; });
    }
    Path.isPath = function (obj) {
        return typeof obj === 'string' || obj && obj.constructor === Path;
    };
    Path.prototype.decode = function () {
        this.paths = this.paths.map(decodeURIComponent);
    };
    Path.prototype.isRoot = function () {
        return this.paths.length === 0 || this.paths.length === 1 && this.paths[0].length === 0;
    };
    Path.prototype.fileName = function () {
        return this.paths[this.paths.length - 1];
    };
    Path.prototype.rootName = function () {
        return this.paths[0];
    };
    Path.prototype.parentName = function () {
        return this.paths[this.paths.length - 2];
    };
    Path.prototype.getParent = function () {
        return new Path(this.paths.slice(0, this.paths.length - 1));
    };
    Path.prototype.hasParent = function () {
        return this.paths.length >= 2;
    };
    Path.prototype.removeRoot = function () {
        return this.paths.shift();
    };
    Path.prototype.removeFile = function () {
        return this.paths.pop();
    };
    Path.prototype.getChildPath = function (childPath) {
        var subPath = new Path(childPath);
        var path = this.clone();
        for (var _i = 0, _a = subPath.paths; _i < _a.length; _i++) {
            var subName = _a[_i];
            path.paths.push(subName);
        }
        return path;
    };
    Path.prototype.clone = function () {
        return new Path(this);
    };
    Path.prototype.toString = function (endsWithSlash) {
        if (endsWithSlash === void 0) { endsWithSlash = false; }
        var value = '/' + this.paths.join('/');
        if (endsWithSlash && value.length > 1)
            return value + '/';
        return value;
    };
    return Path;
}());
exports.Path = Path;
