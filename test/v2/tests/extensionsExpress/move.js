"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var express = require("express");
exports.default = (function (info, isValid) {
    var server = info.init(1, undefined, false);
    var app = express();
    var ctx = server.createExternalContext();
    server.rootFileSystem().addSubTree(ctx, {
        file1: index_js_1.ResourceType.File
    }, function () {
        app.use(index_js_1.v2.extensions.express('/webdav', server));
        app.listen(server.options.port, function () {
            info.req({
                url: 'http://localhost:' + info.port + '/webdav/file1',
                headers: {
                    destination: '/webdav/file2'
                },
                method: 'MOVE'
            }, index_js_1.v2.HTTPCodes.Created, function () {
                isValid(true);
            });
        });
    });
});
