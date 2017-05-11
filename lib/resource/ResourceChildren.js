"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceChildren = (function () {
    function ResourceChildren() {
    }
    ResourceChildren.prototype.add = function (resource, callback) {
        if (this.children.some(function (c) { return c === resource; })) {
            callback(new Error("The resource already exists."));
            return;
        }
        this.children.push(resource);
        callback(null);
    };
    ResourceChildren.prototype.remove = function (resource, callback) {
        var index = this.children.indexOf(resource);
        if (index === -1) {
            callback(new Error("Can't find the resource."));
            return;
        }
        this.children = this.children.splice(index, 1);
        callback(null);
    };
    return ResourceChildren;
}());
exports.ResourceChildren = ResourceChildren;
function forAll(array, itemFn, onAllAndSuccess, onError) {
    var nb = array.length + 1;
    var error = null;
    array.forEach(function (child) {
        if (error)
            return;
        itemFn(child, function (e) {
            if (e) {
                error = e;
                onError(error);
            }
            else
                go();
        });
    });
    go();
    function go() {
        --nb;
        if (nb === 0 || error)
            return;
        onAllAndSuccess();
    }
}
exports.forAll = forAll;
