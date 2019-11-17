"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
exports.default = (function (info, isValid) {
    var server = info.init(1, {
        headers: {
            test: 'ok!!',
            test2: 'ok 2',
            'Test-Array': ['ok1', 'ok2']
        }
    });
    request({
        url: "http://localhost:" + info.port + "/",
        method: 'PROPFIND'
    }, function (e, res, body) {
        isValid(!e && res.headers['test'] === 'ok!!' && res.headers['test2'] === 'ok 2' && res.headers['test-array'] === 'ok1, ok2', 'Headers from server options are not provided correclty');
    });
});
