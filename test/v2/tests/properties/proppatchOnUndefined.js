"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    info.init(2);
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.proppatch(s, info, 'undefined', index_js_1.v2.HTTPCodes.NotFound, ['<test1></test1>'], null, function (xml) {
            isValid(true);
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.proppatch(s, info, 'file', index_js_1.v2.HTTPCodes.MultiStatus, null, ['<test1 />'], function (xml) {
            var propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
            var value = propstat.find('DAV:prop').elements[0].name;
            if (value !== 'test1')
                return isValid(false, 'The element in the "prop" element must be "test1" but got : ' + value);
            value = propstat.find('DAV:status').findText();
            if (value.indexOf(index_js_1.v2.HTTPCodes.OK.toString()) === -1)
                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.OK + ' but got : ' + value);
            isValid(true);
        });
    });
});
