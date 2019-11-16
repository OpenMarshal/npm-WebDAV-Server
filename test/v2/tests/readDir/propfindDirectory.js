"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createDir_1 = require("./.createDir");
exports.default = (function (info, isValid) {
    var server1 = info.init(2);
    _createDir_1.starter(server1, info, isValid, function (r, subFiles) {
        info.reqXML({
            url: 'http://localhost:' + info.port + '/folder',
            method: 'PROPFIND',
            headers: {
                depth: 1
            }
        }, index_js_1.v2.HTTPCodes.MultiStatus, function (req, body) {
            try {
                var sub = body.find('DAV:multistatus').findMany('DAV:response').map(function (r) { return r.find('DAV:propstat').find('DAV:prop').find('DAV:displayname').findText(); });
                subFiles.push('folder');
                for (var _i = 0, sub_1 = sub; _i < sub_1.length; _i++) {
                    var sf = sub_1[_i];
                    var index = subFiles.indexOf(sf);
                    if (index === -1)
                        return isValid(false, 'Got a file name in "readDir(...)" which must not exist here : ' + sf);
                    subFiles.splice(index, 1);
                }
                isValid(subFiles.length === 0, 'All children were not returned ; here are the left ones : ' + subFiles.toString());
            }
            catch (ex) {
                isValid(false, 'Invalid WebDAV response body.', ex);
            }
        });
    });
    var server2 = info.startServer();
    _createDir_1.starter(server2, info, isValid, function (r, subFiles) {
        info.reqXML({
            url: 'http://localhost:' + info.port + '/folder',
            method: 'PROPFIND',
            headers: {
                depth: 0
            }
        }, index_js_1.v2.HTTPCodes.MultiStatus, function (req, body) {
            try {
                isValid(body.find('DAV:multistatus').findMany('DAV:response').length === 1, 'Too many or not enought DAV:response tags.');
            }
            catch (ex) {
                isValid(false, 'Invalid WebDAV response body.', ex);
            }
        });
    });
});
