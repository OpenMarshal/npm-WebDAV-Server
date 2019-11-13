"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var path = require("path");
var fs = require("fs");
var index = 0;
function getPath(index, subName) {
    var rootPath = path.join(__dirname, 'persistence' + index.toString());
    if (subName)
        return path.join(rootPath, subName);
    else
        return rootPath;
}
function starter(info, isValid, callback) {
    var currentIndex = ++index;
    var root = getPath(currentIndex);
    var folder = getPath(currentIndex, 'data');
    var file = getPath(currentIndex, 'save.json');
    var fileTemp = getPath(currentIndex, 'save.tmp.json');
    var server = info.startServer({
        autoSave: {
            treeFilePath: file,
            tempTreeFilePath: fileTemp,
            onSaveError: function (e) {
                isValid(false, e);
            }
        }
    });
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'emptyFolder1': index_js_1.v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': index_js_1.v2.ResourceType.Directory,
            'file2': index_js_1.v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': index_js_1.v2.ResourceType.Directory,
                'file3': index_js_1.v2.ResourceType.File
            }
        },
        'file1': index_js_1.v2.ResourceType.File
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        fs.rmdir(folder, function () {
            fs.unlink(file, function () {
                fs.unlink(fileTemp, function () {
                    fs.mkdir(root, function (e) {
                        callback(server, folder, file, fileTemp);
                    });
                });
            });
        });
    });
}
exports.starter = starter;
