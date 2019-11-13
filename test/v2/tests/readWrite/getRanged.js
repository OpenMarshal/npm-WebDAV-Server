"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createFileTxt_1 = require("./.createFileTxt");
var content = 'Helio!';
function go(info, isValid, range, callback) {
    _createFileTxt_1.starter(info.startServer(), info, isValid, content, function (r, s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file.txt',
            method: 'GET',
            headers: {
                'Range': range
            }
        }, function (res, body) {
            callback(res.statusCode, res.headers, body);
        });
    });
}
function goHead(info, isValid, range, callback) {
    _createFileTxt_1.starter(info.startServer(), info, isValid, content, function (r, s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file.txt',
            method: 'HEAD',
            headers: {
                'Range': range
            }
        }, function (res) {
            callback(res.statusCode, res.headers);
        });
    });
}
exports.default = (function (info, isValid) {
    var server = info.init(22);
    go(info, isValid, 'bytes=0-100', function (statusCode, headers, body) {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    });
    go(info, isValid, 'bytes=-100', function (statusCode, headers, body) {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    });
    go(info, isValid, 'bytes=0-1', function (statusCode, headers, body) {
        isValid(headers['content-length'] === '2', 'The content length returned must be equals to 2 when 0-1 is asked, but instead of ' + 2 + ', got ' + headers['content-length'] + '.');
    });
    go(info, isValid, 'bytes=0-0', function (statusCode, headers, body) {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    });
    go(info, isValid, 'bytes=-1', function (statusCode, headers, body) {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    });
    goHead(info, isValid, 'bytes=0-100', function (statusCode, headers) {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    });
    goHead(info, isValid, 'bytes=-100', function (statusCode, headers) {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    });
    goHead(info, isValid, 'bytes=0-1', function (statusCode, headers) {
        isValid(headers['content-length'] === '2', 'The content length returned must be equals to 2 when 0-1 is asked, but instead of ' + 2 + ', got ' + headers['content-length'] + '.');
    });
    goHead(info, isValid, 'bytes=0-0', function (statusCode, headers) {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    });
    goHead(info, isValid, 'bytes=-1', function (statusCode, headers) {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    });
    go(info, isValid, 'bytes=0-100', function (statusCode, headers, body) {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=0-0', function (statusCode, headers, body) {
        isValid(body === 'H', 'Expected "H" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=1-1', function (statusCode, headers, body) {
        isValid(body === 'e', 'Expected "e" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=' + (content.length - 1) + '-' + (content.length - 1), function (statusCode, headers, body) {
        isValid(body === '!', 'Expected "!" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=0-', function (statusCode, headers, body) {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=1-', function (statusCode, headers, body) {
        var expected = content.substr(1);
        isValid(body === expected, 'Expected "' + expected + '" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=100-', function (statusCode, headers, body) {
        isValid(body === '', 'Expected "" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=-0', function (statusCode, headers, body) {
        isValid(body === '', 'Expected "" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=-1', function (statusCode, headers, body) {
        isValid(body === '!', 'Expected "!" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=-100', function (statusCode, headers, body) {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=0-0,1-1', function (statusCode, headers, body) {
        isValid(/^--[^\n]+\n[^\n]+\n[^\n]+\n\r\nH\r\n--[^\n]+\n[^\n]+\n[^\n]+\n\r\ne\r\n--[^-]+--$/.test(body), 'Expected multipart "H -- e" but got "' + body + '".');
    });
    go(info, isValid, 'bytes=-1,1-1', function (statusCode, headers, body) {
        isValid(/^--[^\n]+\n[^\n]+\n[^\n]+\n\r\n!\r\n--[^\n]+\n[^\n]+\n[^\n]+\n\r\ne\r\n--[^-]+--$/.test(body), 'Expected multipart "! -- e" but got "' + body + '".');
    });
});
