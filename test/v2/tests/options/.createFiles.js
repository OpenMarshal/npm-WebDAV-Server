"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function starter(server, info, isValid, name, expect, reject, callback) {
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'folder': index_js_1.v2.ResourceType.Directory,
        'file': index_js_1.v2.ResourceType.File,
        'hybrid': index_js_1.v2.ResourceType.Hybrid,
        'noResource': index_js_1.v2.ResourceType.NoResource,
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        info.req({
            url: 'http://localhost:' + server.options.port + '/' + name,
            method: 'OPTIONS'
        }, index_js_1.v2.HTTPCodes.OK, function (req) {
            if (!req.headers.allow)
                return isValid(false, 'No "Allow" header returned in the response of the OPTIONS, but expected one.', JSON.stringify(req.headers, null, 4));
            var allow = req.headers.allow.split(',').map(function (s) { return s.trim().toLowerCase(); });
            reject = reject.map(function (s) { return s.trim().toLowerCase(); });
            expect = expect.map(function (s) { return s.trim().toLowerCase(); });
            var rejected = reject.filter(function (r) { return allow.some(function (a) { return a === r; }); });
            if (rejected.length > 0)
                return isValid(false, 'Forbidden methods for resource present in the "Allow" header in the response.', rejected.toString());
            var expected = expect.filter(function (r) { return !allow.some(function (a) { return a === r; }); });
            if (expected.length > 0)
                return isValid(false, 'All expected methods are not present in the "Allow" header in the response.', expected.toString());
            callback(allow);
        });
    });
}
exports.starter = starter;
