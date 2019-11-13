"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
exports.default = (function (info, isValid) {
    var server = info.init(2);
    var server2 = info.startServer();
    server2.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server2), {
        'emptyFolder1': index_js_1.v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': index_js_1.v2.ResourceType.Directory,
            'file2': 'Hello!',
            'folder2': {
                'emptyFolder3': index_js_1.v2.ResourceType.Directory,
                'file3': 'Hello!'
            },
            'folder2x': {
                'emptyFolder3x': index_js_1.v2.ResourceType.Directory,
                'file3x': 'Hello!'
            }
        },
        'file1': 'Hello!'
    }, function (e) {
        var check = function (path, callback) {
            info.req({
                url: 'http://localhost:' + server2.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, index_js_1.v2.HTTPCodes.MultiStatus, function () {
                callback();
            });
        };
        var checkContent = function (path, content, callback) {
            info.req({
                url: 'http://localhost:' + server2.options.port + '/' + path,
                method: 'GET'
            }, index_js_1.v2.HTTPCodes.OK, function (res, rContent) {
                if (rContent === content)
                    return callback();
                isValid(false);
            });
        };
        check('file1', function () {
            check('emptyFolder1', function () {
                check('folder1', function () {
                    check('folder1/file2', function () {
                        check('folder1/emptyFolder2', function () {
                            check('folder1/folder2', function () {
                                check('folder1/folder2/emptyFolder3', function () {
                                    check('folder1/folder2/file3', function () {
                                        check('folder1/folder2x', function () {
                                            check('folder1/folder2x/emptyFolder3x', function () {
                                                check('folder1/folder2x/file3x', function () {
                                                    checkContent('file1', 'Hello!', function () {
                                                        checkContent('folder1/file2', 'Hello!', function () {
                                                            checkContent('folder1/folder2/file3', 'Hello!', function () {
                                                                checkContent('folder1/folder2x/file3x', 'Hello!', function () {
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
                            });
                        });
                    });
                });
            });
        });
    });
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'emptyFolder1': index_js_1.v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': index_js_1.v2.ResourceType.Directory,
            'file2': index_js_1.v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': index_js_1.v2.ResourceType.Directory,
                'file3': index_js_1.v2.ResourceType.File
            },
            'folder2x': {
                'emptyFolder3x': index_js_1.v2.ResourceType.Directory,
                'file3x': index_js_1.v2.ResourceType.File
            }
        },
        'file1': index_js_1.v2.ResourceType.File
    }, function (e) {
        var check = function (path, callback) {
            info.req({
                url: 'http://localhost:' + server.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, index_js_1.v2.HTTPCodes.MultiStatus, function () {
                callback();
            });
        };
        check('file1', function () {
            check('emptyFolder1', function () {
                check('folder1', function () {
                    check('folder1/file2', function () {
                        check('folder1/emptyFolder2', function () {
                            check('folder1/folder2', function () {
                                check('folder1/folder2/emptyFolder3', function () {
                                    check('folder1/folder2/file3', function () {
                                        check('folder1/folder2x', function () {
                                            check('folder1/folder2x/emptyFolder3x', function () {
                                                check('folder1/folder2x/file3x', function () {
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
            });
        });
    });
});
