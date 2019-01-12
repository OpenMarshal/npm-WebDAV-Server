"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hasStartsWith = String.prototype.startsWith;
if (hasStartsWith) {
    exports.startsWith = function (str, strToFind) {
        return str.startsWith(strToFind);
    };
}
else {
    exports.startsWith = function (str, strToFind) {
        return str.lastIndexOf(strToFind, 0) === 0;
    };
}
