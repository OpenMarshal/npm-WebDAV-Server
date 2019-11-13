"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createPersistenceContext_1 = require("./.createPersistenceContext");
var fs = require("fs");
exports.default = (function (info, isValid) {
    info.init(1);
    _createPersistenceContext_1.starter(info, isValid, function (server, folder, file, fileTmp) {
        info.req({
            url: 'http://localhost:' + server.options.port + '/file1',
            method: 'PUT',
            body: 'This is my content!'
        }, function () {
            setTimeout(function () {
                fs.exists(file, function (exists) {
                    isValid(exists, 'The save file is not created.');
                });
            }, 1000);
        });
    });
});
