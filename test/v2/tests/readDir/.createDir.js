"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function starter(server, info, isValid, callback) {
    var _a;
    var subFiles = [
        'subFolder1',
        'subFolder2',
        'subFile1',
        'subFile2',
        'folder%20no%20space',
        'subFolder3',
        'sub Folder 4',
        'file漢字',
        'dir漢字',
        'this is a file',
        'this is a directory',
        'vfs'
    ];
    var allFiles = [
        'subFolder1',
        'subFolder2',
        'subFile1',
        'subFile2',
        'folder%20no%20space',
        'folder%20no%20space/file',
        'folder%20no%20space/folder',
        'subFolder3',
        'subFolder3/file漢字',
        'subFolder3/dir漢字',
        'subFolder3/this is a file',
        'subFolder3/this is a directory',
        'sub Folder 4',
        'sub Folder 4/file漢字',
        'sub Folder 4/dir漢字',
        'sub Folder 4/this is a file',
        'sub Folder 4/this is a directory',
        'file漢字',
        'dir漢字',
        'this is a file',
        'this is a directory',
        'vfs',
        'vfs/file',
        'vfs/folder'
    ];
    var name = 'folder';
    var ctx = index_js_1.v2.ExternalRequestContext.create(server);
    var vfs = new index_js_1.v2.VirtualFileSystem();
    server.rootFileSystem().addSubTree(ctx, (_a = {},
        _a[name] = {
            'subFolder1': index_js_1.v2.ResourceType.Directory,
            'subFolder2': index_js_1.v2.ResourceType.Directory,
            'subFile1': index_js_1.v2.ResourceType.File,
            'subFile2': index_js_1.v2.ResourceType.File,
            'folder%20no%20space': {
                'file': index_js_1.v2.ResourceType.File,
                'folder': index_js_1.v2.ResourceType.Directory
            },
            'subFolder3': {
                'file漢字': index_js_1.v2.ResourceType.File,
                'dir漢字': index_js_1.v2.ResourceType.Directory,
                'this is a file': index_js_1.v2.ResourceType.File,
                'this is a directory': index_js_1.v2.ResourceType.Directory
            },
            'sub Folder 4': {
                'file漢字': index_js_1.v2.ResourceType.File,
                'dir漢字': index_js_1.v2.ResourceType.Directory,
                'this is a file': index_js_1.v2.ResourceType.File,
                'this is a directory': index_js_1.v2.ResourceType.Directory
            },
            'file漢字': index_js_1.v2.ResourceType.File,
            'dir漢字': index_js_1.v2.ResourceType.Directory,
            'this is a file': index_js_1.v2.ResourceType.File,
            'this is a directory': index_js_1.v2.ResourceType.Directory
        },
        _a), function (e) {
        server.setFileSystem("/" + name + "/vfs", vfs, function () {
            vfs.addSubTree(ctx, {
                'file': index_js_1.v2.ResourceType.File,
                'folder': index_js_1.v2.ResourceType.Directory
            }, function () {
                if (e)
                    return isValid(false, 'Cannot call "addSubTree(...)".', e);
                server.getResource(ctx, '/' + name, function (e, r) {
                    if (e)
                        return isValid(false, 'Could not find /' + name, e);
                    callback(r, subFiles, allFiles);
                });
            });
        });
    });
}
exports.starter = starter;
