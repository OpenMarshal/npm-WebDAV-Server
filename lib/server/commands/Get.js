"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var stream_1 = require("stream");
var RangedStream = (function (_super) {
    __extends(RangedStream, _super);
    function RangedStream(min, max) {
        var _this = _super.call(this) || this;
        _this.min = min;
        _this.max = max;
        _this.nb = 0;
        return _this;
    }
    RangedStream.prototype._transform = function (chunk, encoding, callback) {
        if (this.nb < this.min) {
            this.nb += chunk.length;
            if (this.nb > this.min) {
                chunk = chunk.slice(this.nb - this.min);
                callback(null, chunk);
            }
            else
                callback(null, new Buffer(0));
        }
        else if (this.nb > this.max) {
            this.nb += chunk.length;
            callback(null, new Buffer(0));
        }
        else {
            this.nb += chunk.length;
            if (this.nb > this.max)
                chunk = chunk.slice(0, this.max - (this.nb - chunk.length));
            callback(null, chunk);
        }
    };
    return RangedStream;
}(stream_1.Transform));
function default_1(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, r) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            arg.checkIfHeader(r, function () {
                var targetSource = arg.isSource;
                arg.requirePrivilege(targetSource ? ['canRead', 'canSource'] : ['canRead'], r, function () {
                    r.read(targetSource, function (e, rstream) { return process.nextTick(function () {
                        if (e) {
                            arg.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                            callback();
                        }
                        else {
                            arg.invokeEvent('read', r);
                            var range = arg.findHeader('Range');
                            if (range) {
                                var rex = /([0-9]+)/g;
                                var min = parseInt(rex.exec(range)[1], 10);
                                var max = parseInt(rex.exec(range)[1], 10);
                                arg.setCode(WebDAVRequest_1.HTTPCodes.PartialContent);
                                arg.response.setHeader('Accept-Ranges', 'bytes');
                                arg.response.setHeader('Content-Length', (max - min).toString());
                                arg.response.setHeader('Content-Range', 'bytes ' + min + '-' + max + '/*');
                                rstream.on('end', callback);
                                rstream.pipe(new RangedStream(min, max)).pipe(arg.response);
                            }
                            else {
                                arg.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                rstream.on('end', callback);
                                rstream.pipe(arg.response);
                            }
                        }
                    }); });
                });
            });
        });
    });
}
exports.default = default_1;
