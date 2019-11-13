"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createPersistenceContext_1 = require("./.createPersistenceContext");
function prob(server, isValid, path, expectedType, callback) {
    var ctx = server.createExternalContext();
    server.getResource(ctx, path, function (e, r) {
        if (e)
            return isValid(false, 'Could not find the resource ' + path, e);
        r.type(function (e, type) {
            if (e)
                return isValid(false, 'Error with the resource ' + path, e);
            if (type !== expectedType)
                return isValid(false, 'Wrong type for the resource ' + path);
            callback();
        });
    });
}
exports.default = (function (info, isValid) {
    info.init(1);
    _createPersistenceContext_1.starter(info, isValid, function (server, folder, file, fileTmp) {
        info.req({
            url: 'http://localhost:' + server.options.port + '/file1',
            method: 'PUT',
            body: 'This is my content!'
        }, function () {
            setTimeout(function () {
                var server2 = info.startServer(server.options);
                server2.autoLoad(function (e) {
                    isValid(!e, 'Could not autoLoad the supposed saved server state.', e);
                    prob(server2, isValid, '/folder1', index_js_1.v2.ResourceType.Directory, function () {
                        prob(server2, isValid, '/folder1/emptyFolder2', index_js_1.v2.ResourceType.Directory, function () {
                            prob(server2, isValid, '/folder1/file2', index_js_1.v2.ResourceType.File, function () {
                                prob(server2, isValid, '/folder1/folder2', index_js_1.v2.ResourceType.Directory, function () {
                                    prob(server2, isValid, '/folder1/folder2/emptyFolder3', index_js_1.v2.ResourceType.Directory, function () {
                                        prob(server2, isValid, '/folder1/folder2/file3', index_js_1.v2.ResourceType.File, function () {
                                            prob(server2, isValid, '/emptyFolder1', index_js_1.v2.ResourceType.Directory, function () {
                                                prob(server2, isValid, '/file1', index_js_1.v2.ResourceType.File, function () {
                                                    isValid(true);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }, 1000);
        });
    });
});
