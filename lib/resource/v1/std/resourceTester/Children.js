"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualFolder_1 = require("../../virtual/VirtualFolder");
var VirtualFile_1 = require("../../virtual/VirtualFile");
// ****************************** Children ****************************** //
function addChild(callback) {
    var _this = this;
    callback = this.multiple(callback, 3);
    this.producer(false, function (r1) {
        _this.producer(false, function (r2) {
            r1.addChild(r2, function (e) {
                callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                    callback(null, r2.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
                });
            });
        });
    });
    this.producer(false, function (r1) {
        var vf = new VirtualFolder_1.VirtualFolder('folder');
        r1.addChild(vf, function (e) {
            callback(e, !e, 'addChild error adding a virtual folder', _this.options.canHaveVirtualFolderChildren, function () {
                callback(null, vf.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
            });
        });
    });
    this.producer(false, function (r1) {
        var vf = new VirtualFile_1.VirtualFile('file');
        r1.addChild(vf, function (e) {
            callback(e, !e, 'addChild error adding a virtual file', _this.options.canHaveVirtualFileChildren, function () {
                callback(null, vf.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
            });
        });
    });
}
exports.addChild = addChild;
function removeChild(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        _this.producer(false, function (r2) {
            r1.addChild(r2, function (e) {
                callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                    r1.removeChild(r2, function (e) {
                        callback(e, !e, 'removeChild error removing a produced resource', _this.options.canRemoveChildren, function () {
                            callback(null, !r2.parent, 'The parent property of child resource is not valid, it must be empty (null or undefined)');
                        });
                    });
                });
            });
        });
    });
}
exports.removeChild = removeChild;
function getChildren(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    if (!this.options.canGetChildren) {
        this.producer(false, function (r1) {
            r1.getChildren(function (e, children) {
                callback(e, !e, 'getChildren must fail', false);
            });
        });
        return;
    }
    this.producer(false, function (r1) {
        _this.producer(false, function (r2) {
            _this.producer(false, function (r3) {
                r1.addChild(r2, function (e) {
                    callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                        r1.addChild(r3, function (e) {
                            callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                                r1.getChildren(function (e, children) {
                                    callback(e, !e, 'getChildren error', undefined, function () {
                                        var valid = {
                                            r3: false,
                                            r2: false
                                        };
                                        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                                            var child = children_1[_i];
                                            if (child === r3)
                                                valid.r3 = true;
                                            else if (child === r2)
                                                valid.r2 = true;
                                        }
                                        callback(null, valid.r3 && valid.r2, 'At least one of the added resources is not present in the result of getChildren');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
exports.getChildren = getChildren;
