"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceChildren = (function () {
    function ResourceChildren() {
        this.children = [];
    }
    ResourceChildren.prototype.add = function (resource, callback) {
        if (this.children.some(function (c) { return c === resource; })) {
            callback(new Error('The resource already exists.'));
            return;
        }
        this.children.push(resource);
        callback(null);
    };
    ResourceChildren.prototype.remove = function (resource, callback) {
        var index = this.children.indexOf(resource);
        if (index === -1) {
            callback(new Error('Can\'t find the resource.'));
            return;
        }
        this.children.splice(index, 1);
        callback(null);
    };
    return ResourceChildren;
}());
exports.ResourceChildren = ResourceChildren;
