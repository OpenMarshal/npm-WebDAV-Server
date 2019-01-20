"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../../Errors");
var ResourceChildren = /** @class */ (function () {
    function ResourceChildren() {
        this.children = [];
    }
    ResourceChildren.prototype.add = function (resource, callback) {
        if (this.children.some(function (c) { return c === resource; })) {
            callback(Errors_1.Errors.ResourceAlreadyExists);
            return;
        }
        this.children.push(resource);
        callback(null);
    };
    ResourceChildren.prototype.remove = function (resource, callback) {
        var index = this.children.indexOf(resource);
        if (index === -1) {
            callback(Errors_1.Errors.ResourceNotFound);
            return;
        }
        this.children.splice(index, 1);
        callback(null);
    };
    return ResourceChildren;
}());
exports.ResourceChildren = ResourceChildren;
