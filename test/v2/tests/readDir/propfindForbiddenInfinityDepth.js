"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createDir_1 = require("./.createDir");
exports.default = (function (info, isValid) {
    function test(inputServer, info, isValid, depth) {
        var server = inputServer || info.startServer();
        _createDir_1.starter(server, info, isValid, function (r, subFiles, allFiles) {
            info.reqXML({
                url: 'http://localhost:' + info.port + '/folder',
                method: 'PROPFIND',
                headers: {
                    depth: depth
                }
            }, index_js_1.v2.HTTPCodes.Forbidden, function () {
                isValid(true);
            });
        });
    }
    var depthValues = [
        'infinity',
        'InFiNiTy',
        -1
    ];
    var firstServer = info.init(depthValues.length);
    for (var i = 0; i < depthValues.length; ++i) {
        var depth = depthValues[i];
        test(i === 0 ? firstServer : undefined, info, isValid, depth);
    }
});
