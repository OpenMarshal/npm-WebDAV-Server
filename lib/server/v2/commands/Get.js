"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var stream_1 = require("stream");
var RangedStream = /** @class */ (function (_super) {
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
            var lastNb = this.nb;
            this.nb += chunk.length;
            if (this.nb > this.min) {
                var start = this.min - lastNb;
                chunk = chunk.slice(start, this.nb > this.max ? this.max - this.min + 1 + start : undefined);
                callback(null, chunk);
            }
            else
                callback(null, Buffer.alloc(0));
        }
        else if (this.nb > this.max) {
            this.nb += chunk.length;
            callback(null, Buffer.alloc(0));
        }
        else {
            this.nb += chunk.length;
            if (this.nb > this.max)
                chunk = chunk.slice(0, this.max - (this.nb - chunk.length) + 1);
            callback(null, chunk);
        }
    };
    return RangedStream;
}(stream_1.Transform));
var MultipleRangedStream = /** @class */ (function (_super) {
    __extends(MultipleRangedStream, _super);
    function MultipleRangedStream(ranges) {
        var _this = _super.call(this) || this;
        _this.ranges = ranges;
        _this.streams = ranges.map(function (r) {
            return {
                stream: new RangedStream(r.min, r.max),
                range: r
            };
        });
        return _this;
    }
    MultipleRangedStream.prototype._transform = function (chunk, encoding, callback) {
        this.streams.forEach(function (streamRange) {
            streamRange.stream.write(chunk, encoding);
        });
        callback(null, Buffer.alloc(0));
    };
    MultipleRangedStream.prototype.end = function (chunk, encoding, cb) {
        var _this = this;
        if (this.onEnded)
            process.nextTick(function () { return _this.onEnded(); });
        _super.prototype.end.call(this, chunk, encoding, cb);
    };
    return MultipleRangedStream;
}(stream_1.Transform));
function parseRangeHeader(mimeType, size, range) {
    var separator = Array.apply(null, { length: 20 })
        .map(function () { return String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 26)); })
        .join('');
    var createMultipart = function (range) {
        return "--" + separator + "\r\nContent-Type: " + mimeType + "\r\nContent-Range: bytes " + range.min + "-" + range.max + "/*\r\n\r\n";
    };
    var endMultipart = function () {
        return "\r\n--" + separator + "--";
    };
    var ranges = range
        .split(',')
        .map(function (block) { return parseRangeBlock(size, block); });
    var len = ranges.reduce(function (previous, mm) { return mm.max - mm.min + 1 + previous; }, 0)
        + (ranges.length <= 1 ?
            0 : ranges.reduce(function (previous, mm) { return createMultipart(mm).length + previous; }, endMultipart().length + '\r\n'.length * (ranges.length - 1)));
    return {
        ranges: ranges,
        separator: separator,
        len: len,
        createMultipart: createMultipart,
        endMultipart: endMultipart
    };
}
exports.parseRangeHeader = parseRangeHeader;
function parseRangeBlock(size, block) {
    size -= 1;
    var rRange = /([0-9]+)-([0-9]+)/;
    var match = rRange.exec(block);
    if (match)
        return {
            min: Math.min(size, parseInt(match[1], 10)),
            max: Math.min(size, parseInt(match[2], 10))
        };
    var rStart = /([0-9]+)-/;
    match = rStart.exec(block);
    if (match)
        return {
            min: Math.min(size + 1, parseInt(match[1], 10)),
            max: size
        };
    var rEnd = /-([0-9]+)/;
    match = rEnd.exec(block);
    if (match)
        return {
            min: Math.max(0, size - parseInt(match[1], 10) + 1),
            max: size
        };
    throw new Error('Cannot parse the range block');
}
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        ctx.noBodyExpected(function () {
            ctx.getResource(function (e, r) {
                ctx.checkIfHeader(r, function () {
                    var targetSource = ctx.headers.isSource;
                    //ctx.requirePrivilegeEx(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], () => {
                    r.type(function (e, type) {
                        if (e) {
                            if (!ctx.setCodeFromError(e))
                                ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                            return callback();
                        }
                        if (!type.isFile) {
                            ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                            return callback();
                        }
                        var range = ctx.headers.find('Range');
                        r.size(targetSource, function (e, size) { return process.nextTick(function () {
                            if (e && !range) {
                                if (!ctx.setCodeFromError(e))
                                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                return callback();
                            }
                            r.mimeType(targetSource, function (e, mimeType) { return process.nextTick(function () {
                                if (e) {
                                    if (!ctx.setCodeFromError(e))
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    return callback();
                                }
                                r.openReadStream(targetSource, function (e, rstream) {
                                    if (e) {
                                        if (!ctx.setCodeFromError(e))
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.MethodNotAllowed);
                                        return callback();
                                    }
                                    //ctx.invokeEvent('read', r);
                                    rstream.on('error', function (e) {
                                        if (!ctx.setCodeFromError(e))
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                        return callback();
                                    });
                                    if (range) {
                                        try {
                                            var _a = parseRangeHeader(mimeType, size, range), ranges_1 = _a.ranges, separator = _a.separator, len = _a.len, createMultipart_1 = _a.createMultipart, endMultipart_1 = _a.endMultipart;
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.PartialContent);
                                            ctx.response.setHeader('Accept-Ranges', 'bytes');
                                            ctx.response.setHeader('Content-Length', len.toString());
                                            if (ranges_1.length <= 1) {
                                                ctx.response.setHeader('Content-Type', mimeType);
                                                ctx.response.setHeader('Content-Range', "bytes " + ranges_1[0].min + "-" + ranges_1[0].max + "/*");
                                                rstream.on('end', callback);
                                                return rstream.pipe(new RangedStream(ranges_1[0].min, ranges_1[0].max)).pipe(ctx.response);
                                            }
                                            ctx.response.setHeader('Content-Type', "multipart/byteranges; boundary=" + separator);
                                            var multi_1 = new MultipleRangedStream(ranges_1);
                                            rstream.pipe(multi_1);
                                            var current_1 = 0;
                                            var dones_1 = {};
                                            var evalNext_1 = function () {
                                                if (current_1 === ranges_1.length) {
                                                    return ctx.response.end(endMultipart_1(), function () {
                                                        callback();
                                                    });
                                                }
                                                var sr = dones_1[current_1];
                                                if (sr) {
                                                    if (current_1 > 0)
                                                        ctx.response.write('\r\n');
                                                    ctx.response.write(createMultipart_1(sr.range));
                                                    sr.stream.on('end', function () {
                                                        ++current_1;
                                                        evalNext_1();
                                                    });
                                                    sr.stream.on('data', function (chunk, encoding) {
                                                        ctx.response.write(chunk, encoding);
                                                    });
                                                    //sr.stream.pipe(ctx.response);
                                                }
                                            };
                                            multi_1.streams.forEach(function (sr, index) {
                                                dones_1[index] = sr;
                                            });
                                            multi_1.onEnded = function () {
                                                multi_1.streams.forEach(function (sr, index) {
                                                    sr.stream.end();
                                                });
                                                evalNext_1();
                                            };
                                        }
                                        catch (ex) {
                                            ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                                            callback();
                                        }
                                    }
                                    else {
                                        ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                                        ctx.response.setHeader('Accept-Ranges', 'bytes');
                                        ctx.response.setHeader('Content-Type', mimeType);
                                        if (size !== null && size !== undefined && size > -1)
                                            ctx.response.setHeader('Content-Length', size.toString());
                                        rstream.on('end', callback);
                                        rstream.pipe(ctx.response);
                                    }
                                });
                            }); });
                        }); });
                    });
                    //})
                });
            });
        });
    };
    default_1.prototype.isValidFor = function (ctx, type) {
        return type && type.isFile;
    };
    return default_1;
}());
exports.default = default_1;
