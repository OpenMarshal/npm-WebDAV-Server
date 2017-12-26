"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualFolder_1 = require("../../virtual/VirtualFolder");
// ****************************** Actions ****************************** //
function create(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(true, function (r1) {
        r1.create(function (e) {
            callback(e, !e, 'create error', _this.options.canBeCreated);
        });
    });
}
exports.create = create;
function deleteResource(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(true, function (r1) {
        r1.create(function (e) {
            callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                r1.delete(function (e) {
                    callback(e, !e, 'delete error', _this.options.canBeDeleted);
                });
            });
        });
    });
}
exports.deleteResource = deleteResource;
function moveTo(callback) {
    callback = this.multiple(callback, 1);
    if (!this.options.canHaveChildren) {
        callback(null, true, '');
        return;
    }
    var vf1 = new VirtualFolder_1.VirtualFolder('folder1');
    var vf2 = new VirtualFolder_1.VirtualFolder('folder2');
    if (!this.options.canBeMoved) {
        this.producer(false, function (r1) {
            vf1.addChild(r1, function (e) {
                callback(e, !e, 'addChild error', undefined, function () {
                    r1.moveTo(vf2, 'newName', false, function (e) {
                        callback(e, !e, 'moveTo must fail', false);
                    });
                });
            });
        });
        return;
    }
    this.producer(false, function (r1) {
        vf1.addChild(r1, function (e) {
            callback(e, !e, 'addChild error of VirtualFolder', undefined, function () {
                r1.moveTo(vf2, 'newName', false, function (e) {
                    callback(e, !e, 'moveTo must not fail' /*, undefined, () => {
                        callback(null, r1.parent === vf2, 'The parent property of the resource must be changed')
                    }*/);
                });
            });
        });
    });
}
exports.moveTo = moveTo;
function rename(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    var newName = 'TEST-test_test Test%20' + this.uuid().toString();
    this.producer(false, function (r1) {
        r1.rename(newName, function (e) {
            callback(e, !e, 'rename error', _this.options.canBeRenamed, function () {
                r1.webName(function (e, name) {
                    callback(e, !e, 'webName error', undefined, function () {
                        callback(null, newName === name, 'rename did not rename the resource', _this.options.canBeRenamed);
                    });
                });
            });
        });
    });
}
exports.rename = rename;
