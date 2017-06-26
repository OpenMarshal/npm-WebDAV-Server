"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function invokeBARequest(collection, base, callback) {
    function callCallback() {
        if (callback)
            process.nextTick(callback);
    }
    if (collection.length === 0) {
        callCallback();
        return;
    }
    var nb = collection.length + 1;
    function next() {
        --nb;
        if (nb === 0) {
            callCallback();
        }
        else
            process.nextTick(function () { return collection[collection.length - nb](base, next); });
    }
    next();
}
function invokeBeforeRequest(base, callback) {
    invokeBARequest(this.beforeManagers, base, callback);
}
exports.invokeBeforeRequest = invokeBeforeRequest;
function invokeAfterRequest(base, callback) {
    invokeBARequest(this.afterManagers, base, callback);
}
exports.invokeAfterRequest = invokeAfterRequest;
