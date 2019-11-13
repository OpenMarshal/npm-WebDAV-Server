"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    info.init(3);
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.proppatch(s, info, 'file', index_js_1.v2.HTTPCodes.MultiStatus, ['<D:getetag>"Value"</D:getetag>'], null, function (xml) {
            var propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
            var value = propstat.find('DAV:prop').elements[0].name;
            if (value !== 'DAV:getetag')
                return isValid(false, 'The element in the "prop" element must be "getetag" but got : ' + value);
            value = propstat.find('DAV:status').findText();
            if (value.indexOf(index_js_1.v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.Forbidden + ' but got : ' + value);
            isValid(true);
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.proppatch(s, info, 'file', index_js_1.v2.HTTPCodes.MultiStatus, ['<D:getetagxx>"Value"</D:getetagxx>'], null, function (xml) {
            var propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
            var value = propstat.find('DAV:prop').elements[0].name;
            if (value !== 'DAV:getetagxx')
                return isValid(false, 'The element in the "prop" element must be "getetagxx" but got : ' + value);
            value = propstat.find('DAV:status').findText();
            if (value.indexOf(index_js_1.v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.Forbidden + ' but got : ' + value);
            isValid(true);
        });
    });
    _createFiles_1.starter(info, isValid, function (s) {
        _createFiles_1.proppatch(s, info, 'file', index_js_1.v2.HTTPCodes.MultiStatus, null, ['<D:getetagxx>"Value"</D:getetagxx>'], function (xml) {
            var propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
            var value = propstat.find('DAV:prop').elements[0].name;
            if (value !== 'DAV:getetagxx')
                return isValid(false, 'The element in the "prop" element must be "getetagxx" but got : ' + value);
            value = propstat.find('DAV:status').findText();
            if (value.indexOf(index_js_1.v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.Forbidden + ' but got : ' + value);
            isValid(true);
        });
    });
});
