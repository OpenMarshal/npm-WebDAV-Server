"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    function testStatus(xml, expectedCode, callback) {
        try {
            var status = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:status').findText();
            if (status.indexOf(expectedCode.toString()) === -1)
                return isValid(false, 'The XML repsonse returned a "' + status + '" instead of a status code ' + expectedCode);
            callback();
        }
        catch (ex) {
            return isValid(false, 'Invalid XML response for PROPPATCH', ex);
        }
    }
    _createFiles_1.methodTesterNotBlocking(info, isValid, function (port, user2, cb) {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPFIND',
            headers: {
                Authorization: 'Basic ' + user2,
                Depth: 0
            }
        }, index_js_1.v2.HTTPCodes.MultiStatus, function (res, xml) {
            testStatus(xml, index_js_1.v2.HTTPCodes.OK, function () { return cb(); });
        });
    });
});
