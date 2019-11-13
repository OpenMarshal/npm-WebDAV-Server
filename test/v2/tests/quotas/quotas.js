"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    info.init(11);
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.propfind(s, info, 'folder', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
            var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
            var available = parseInt(props.find('DAV:quota-available-bytes').findText());
            var used = parseInt(props.find('DAV:quota-used-bytes').findText());
            if (available !== 100)
                return isValid(false, 'The "DAV:quota-available-bytes" must be equals to 100');
            if (used > 0)
                return isValid(false, 'The "DAV:quota-used-bytes" must contains 0');
            isValid(true);
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.propfind(s, info, 'file', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
            var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
            var available = parseInt(props.find('DAV:quota-available-bytes').findText());
            var used = parseInt(props.find('DAV:quota-used-bytes').findText());
            if (available !== 100)
                return isValid(false, 'The "DAV:quota-available-bytes" must be equals to 100');
            if (used > 0)
                return isValid(false, 'The "DAV:quota-used-bytes" must contains 0');
            isValid(true);
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file2',
            method: 'PUT'
        }, index_js_1.v2.HTTPCodes.Created, function () {
            _createFiles_1.propfind(s, info, 'file2', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                var available = parseInt(props.find('DAV:quota-available-bytes').findText());
                var used = parseInt(props.find('DAV:quota-used-bytes').findText());
                if (available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if (used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder/file',
            method: 'PUT'
        }, index_js_1.v2.HTTPCodes.Created, function () {
            _createFiles_1.propfind(s, info, 'folder/file', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                var available = parseInt(props.find('DAV:quota-available-bytes').findText());
                var used = parseInt(props.find('DAV:quota-used-bytes').findText());
                if (available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if (used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder2',
            method: 'MKCOL'
        }, index_js_1.v2.HTTPCodes.Created, function () {
            _createFiles_1.propfind(s, info, 'folder2', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                var available = parseInt(props.find('DAV:quota-available-bytes').findText());
                var used = parseInt(props.find('DAV:quota-used-bytes').findText());
                if (available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if (used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');
                isValid(true);
            });
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/folder/folder',
            method: 'MKCOL'
        }, index_js_1.v2.HTTPCodes.Created, function () {
            _createFiles_1.propfind(s, info, 'folder/folder', index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                var props = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:prop');
                var available = parseInt(props.find('DAV:quota-available-bytes').findText());
                var used = parseInt(props.find('DAV:quota-used-bytes').findText());
                if (available >= 100)
                    return isValid(false, 'The "DAV:quota-available-bytes" must be lesser than 100');
                if (used <= 0)
                    return isValid(false, 'The "DAV:quota-used-bytes" must contains a value greater than 0');
                isValid(true);
            });
        });
    });
    var content = '';
    for (var i = 0; i < 1000; ++i)
        content += 'A';
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file2',
            method: 'PUT',
            body: content
        }, index_js_1.v2.HTTPCodes.InsufficientStorage, function () {
            isValid(true);
        });
    });
    var content2 = '';
    for (var i = 0; i < 100; ++i)
        content2 += 'A';
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            body: content2
        }, index_js_1.v2.HTTPCodes.OK, function () {
            isValid(true);
        });
    });
    var content3 = '';
    for (var i = 0; i < 99; ++i)
        content3 += 'A';
    _createFiles_1.starter(info, isValid, function (s) {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            body: content3
        }, index_js_1.v2.HTTPCodes.OK, function () {
            var content4 = '';
            for (var i = 0; i < 99; ++i)
                content4 += 'A';
            _createFiles_1.starter(info, isValid, function (s) {
                info.req({
                    url: 'http://localhost:' + s.options.port + '/file',
                    method: 'PUT',
                    body: content4
                }, index_js_1.v2.HTTPCodes.OK, function () {
                    isValid(true);
                });
            });
        });
    });
    var content5 = '';
    for (var i = 0; i < 100; ++i)
        content5 += 'A';
    _createFiles_1.starter(info, isValid, function (s) {
        info.reqStream({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT'
        }, function (res) {
            isValid(res.statusCode === index_js_1.v2.HTTPCodes.OK);
        }).end(content5);
    });
    var content6 = '';
    for (var i = 0; i < 1000; ++i)
        content6 += 'A';
    _createFiles_1.starter(info, isValid, function (s) {
        info.reqStream({
            url: 'http://localhost:' + s.options.port + '/file',
            method: 'PUT',
            canFail: true
        }, function (res) {
            isValid(res.statusCode === index_js_1.v2.HTTPCodes.InsufficientStorage);
        }).end(content6);
    });
});
