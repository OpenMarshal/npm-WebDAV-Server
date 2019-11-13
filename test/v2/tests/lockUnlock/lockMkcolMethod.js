"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    _createFiles_1.methodTesterBlocking(info, isValid, function (port, user1, user2, cb) {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/folderX',
            method: 'MKCOL',
            headers: {
                Authorization: 'Basic ' + user2
            }
        }, index_js_1.v2.HTTPCodes.Locked, function () {
            info.req({
                url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/folderX',
                method: 'MKCOL',
                headers: {
                    Authorization: 'Basic ' + user1
                }
            }, index_js_1.v2.HTTPCodes.Created, function () {
                cb();
            });
        });
    }, function (port, user2) {
        info.req({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/folderX2',
            method: 'MKCOL',
            headers: {
                Authorization: 'Basic ' + user2
            }
        }, index_js_1.v2.HTTPCodes.Created, function () {
            isValid(true);
        });
    }, true);
});
