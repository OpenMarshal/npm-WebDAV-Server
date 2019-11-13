"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(5);
    _createFiles_1.starter(server1, info, isValid, 'folder', 0, true, function (lock, user1) {
        _createFiles_1.lockResource(server1, info, isValid, user1, 'folder', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
    var server2 = info.startServer();
    _createFiles_1.starter(server2, info, isValid, 'folder', -1, true, function (lock, user1) {
        _createFiles_1.lockResource(server2, info, isValid, user1, 'folder/folder2/folder3/folder4/file', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
    var server3 = info.startServer();
    _createFiles_1.starter(server3, info, isValid, 'folder', 2, true, function (lock, user1) {
        _createFiles_1.lockResource(server3, info, isValid, user1, 'folder/folder2/folder3/folder4/file', 0, true, function (lock) {
            isValid(true);
        });
    });
    var server4 = info.startServer();
    _createFiles_1.starter(server4, info, isValid, 'folder', 2, true, function (lock, user1) {
        _createFiles_1.lockResource(server4, info, isValid, user1, 'folder/folder2/folder3/folder4/fileX', 0, true, index_js_1.v2.HTTPCodes.Created, function (lock) {
            isValid(true);
        });
    });
    var server5 = info.startServer();
    _createFiles_1.starter(server5, info, isValid, 'folder', -1, true, function (lock, user1) {
        _createFiles_1.lockResource(server5, info, isValid, user1, 'folder/folder2/folder3/folder4/fileX', 0, true, index_js_1.v2.HTTPCodes.Locked, function (lock) {
            isValid(true);
        });
    });
});
