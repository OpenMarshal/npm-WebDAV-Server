"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createDir_1 = require("./.createDir");
exports.default = (function (info, isValid) {
    function test(inputServer, info, isValid, depth) {
        var server = inputServer || info.startServer();
        server.options.maxRequestDepth = Infinity;
        _createDir_1.starter(server, info, isValid, function (r, subFiles, allFiles) {
            info.reqXML({
                url: 'http://localhost:' + info.port + '/folder',
                method: 'PROPFIND',
                headers: {
                    depth: depth
                }
            }, index_js_1.v2.HTTPCodes.MultiStatus, function (req, body, bodySource) {
                try {
                    var sub = body.find('DAV:multistatus').findMany('DAV:response').map(function (r) { return r.find('DAV:location').find('DAV:href').findText(); });
                    allFiles = allFiles.map(function (path) { return "folder/" + path; });
                    allFiles.push('folder');
                    for (var _i = 0, sub_1 = sub; _i < sub_1.length; _i++) {
                        var sf = sub_1[_i];
                        var url = decodeURIComponent(sf);
                        var path = url.substring(url.indexOf('/', url.indexOf('://') + 3) + 1);
                        var index = allFiles.indexOf(path);
                        if (index === -1)
                            return isValid(false, "Got a file name in \"readDir(...)\" which must not exist here with depth " + depth + " : " + path);
                        allFiles.splice(index, 1);
                    }
                    isValid(allFiles.length === 0, "All children were not returned with depth " + depth + " ; here are the left ones : " + allFiles.toString());
                }
                catch (ex) {
                    isValid(false, "Invalid WebDAV response body with depth " + depth + ".", ex);
                }
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
