"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ****************************** Content ****************************** //
function writeRead(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    if (!this.options.canWrite || !this.options.canRead) {
        this.producer(false, function (r1) {
            r1.write(true, function (e, w) {
                callback(e, !e, 'write error', _this.options.canWrite);
            });
        });
        return;
    }
    var values = ['content1', 'content2'];
    var value = values.reduce(function (p, s) { return p + s; });
    var write = function (w, cb) {
        if (values.length === 0) {
            cb();
            return;
        }
        w.write(values.shift(), function (e) {
            callback(e, !e, 'write error', _this.options.canWrite, function () {
                write(w, cb);
            });
        });
    };
    this.producer(false, function (r1) {
        r1.write(true, function (e, w) {
            callback(e, !e, 'write error', undefined, function () {
                write(w, function () {
                    w.end();
                    r1.read(true, function (e, r) {
                        callback(e, !e, 'read error', undefined, function () {
                            var fdata = '';
                            r.on('data', function (data) {
                                fdata += data.toString();
                            });
                            r.on('end', function () {
                                callback(null, fdata && fdata === value, 'The read value must be the same as the written value');
                            });
                        });
                    });
                });
            });
        }, values.join('').length);
    });
}
exports.writeRead = writeRead;
function mimeType(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        r1.mimeType(true, function (e) {
            callback(e, !e, 'mimeType error', _this.options.canGetMimeType);
        });
    });
}
exports.mimeType = mimeType;
function size(callback) {
    var _this = this;
    callback = this.multiple(callback, 1);
    if (!this.options.canWrite || !this.options.canGetSize) {
        this.producer(false, function (r1) {
            r1.size(true, function (e, size) {
                callback(e, !e, 'The size method must fail', _this.options.canGetSize);
            });
        });
        return;
    }
    var value = 'test';
    this.producer(false, function (r1) {
        r1.write(true, function (e, w) {
            callback(e, !e, 'write error', _this.options.canWrite, function () {
                w.end(value, function (e) {
                    callback(e, !e, 'Writable write error', _this.options.canWrite, function () {
                        r1.size(true, function (e, size) {
                            callback(e, !e, 'size error', _this.options.canGetSize, function () {
                                callback(null, size === value.length, 'The size value provided by the size method is invalid');
                            });
                        });
                    });
                });
            });
        }, value.length);
    });
}
exports.size = size;
