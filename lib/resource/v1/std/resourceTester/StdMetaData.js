"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ****************************** Std meta-data ****************************** //
function creationDate(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(true, function (r1) {
        r1.create(function (e) {
            callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                r1.creationDate(function (e, date) {
                    callback(e, !e, 'creationDate error', _this.options.canGetCreationDate);
                });
            });
        });
    });
}
exports.creationDate = creationDate;
function lastModifiedDate(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(true, function (r1) {
        r1.create(function (e) {
            callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                r1.lastModifiedDate(function (e, date) {
                    callback(e, !e, 'lastModifiedDate error', _this.options.canGetLastModifiedDate);
                });
            });
        });
    });
}
exports.lastModifiedDate = lastModifiedDate;
function webName(callback) {
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        r1.webName(function (e) {
            callback(e, !e, 'webName error');
        });
    });
}
exports.webName = webName;
function type(callback) {
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        r1.type(function (e) {
            callback(e, !e, 'type error');
        });
    });
}
exports.type = type;
