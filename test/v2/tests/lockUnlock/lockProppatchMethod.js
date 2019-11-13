"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var proppatch = '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:set><D:prop><Z:Authors><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors></D:prop></D:set></D:propertyupdate>';
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
    _createFiles_1.methodTesterBlocking(info, isValid, function (port, user1, user2, cb) {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPPATCH',
            headers: {
                Authorization: 'Basic ' + user1
            },
            body: proppatch
        }, index_js_1.v2.HTTPCodes.MultiStatus, function (res, xml) {
            testStatus(xml, index_js_1.v2.HTTPCodes.OK, function () {
                info.reqXML({
                    url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
                    method: 'PROPPATCH',
                    headers: {
                        Authorization: 'Basic ' + user2
                    },
                    body: proppatch
                }, index_js_1.v2.HTTPCodes.Locked, function (res, xml) {
                    cb();
                });
            });
        });
    }, function (port, user2) {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPPATCH',
            headers: {
                Authorization: 'Basic ' + user2
            },
            body: proppatch
        }, index_js_1.v2.HTTPCodes.MultiStatus, function (res, xml) {
            testStatus(xml, index_js_1.v2.HTTPCodes.OK, function () {
                isValid(true);
            });
        });
    });
});
