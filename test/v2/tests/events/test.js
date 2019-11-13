"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createPersistenceContext_1 = require("./.createPersistenceContext");
exports.default = (function (info, isValid) {
    info.init(7);
    _createPersistenceContext_1.starter(info, isValid, 'create', function (server, fs) {
        fs.create(server.createExternalContext(), '/x', index_js_1.v2.ResourceType.File, function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'copy', function (server, fs) {
        fs.copy(server.createExternalContext(), '/file2', '/file2.copy', function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'delete', function (server, fs) {
        fs.delete(server.createExternalContext(), '/file3', function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'move', function (server, fs) {
        fs.move(server.createExternalContext(), '/file4', '/file4.moved', function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'openReadStream', function (server, fs) {
        fs.openReadStream(server.createExternalContext(), '/file5', function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'openWriteStream', function (server, fs) {
        fs.openWriteStream(server.createExternalContext(), '/file6', function (e) { });
    });
    _createPersistenceContext_1.starter(info, isValid, 'rename', function (server, fs) {
        fs.rename(server.createExternalContext(), '/file7', 'file7.rename', function (e) { });
    });
});
