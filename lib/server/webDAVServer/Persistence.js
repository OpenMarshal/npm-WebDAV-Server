"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ISerializer_1 = require("../../manager/ISerializer");
function load(obj, managers, callback) {
    var _this = this;
    ISerializer_1.unserialize(obj, managers, function (e, r) {
        if (!e) {
            _this.rootResource = r;
            callback(null);
        }
        else
            callback(e);
    });
}
exports.load = load;
function save(callback) {
    ISerializer_1.serialize(this.rootResource, callback);
}
exports.save = save;
