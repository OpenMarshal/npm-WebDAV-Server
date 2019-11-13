"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createDir_1 = require("./.createDir");
var index_js_1 = require("../../../../lib/index.js");
function test(info, isValid, root, callback) {
    info.reqXML({
        url: 'http://localhost:' + info.port + '/folder' + root,
        method: 'PROPFIND',
        headers: {
            depth: 1
        }
    }, index_js_1.v2.HTTPCodes.MultiStatus, function (req, body) {
        try {
            var sub = body.find('DAV:multistatus').findMany('DAV:response').map(function (r) {
                return {
                    href: r.find('DAV:href').findText(),
                    locationHref: r.find('DAV:location').find('DAV:href').findText(),
                    displayName: r.find('DAV:propstat').find('DAV:prop').find('DAV:displayname').findText()
                };
            });
            var invalidEntries = sub.filter(function (entry) {
                if (entry.href === encodeURI(entry.href))
                    return false;
                return decodeURI(entry.href) === entry.href
                    || decodeURI(entry.locationHref) === entry.locationHref
                    || encodeURI(entry.displayName) === entry.displayName;
            });
            if (invalidEntries.length === 0)
                return callback();
            isValid(false, 'Some resource\'s url are not correctly encoded in PROPFIND in "' + root + '", displayname must not be encoded while location.href and href must be encoded : ' + invalidEntries.map(function (entry) {
                return 'displayName = "' + entry.displayName + '" ; href = "' + entry.href + '" ; location.href = "' + entry.locationHref + '"';
            }).join(' && '));
        }
        catch (ex) {
            isValid(false, 'Invalid WebDAV response body.', ex);
        }
    });
}
exports.default = (function (info, isValid) {
    _createDir_1.starter(info.init(1), info, isValid, function (r, subFiles) {
        test(info, isValid, '/', function () {
            test(info, isValid, '/subFolder3', function () {
                test(info, isValid, '/sub Folder 4', function () {
                    isValid(true);
                });
            });
        });
    });
});
