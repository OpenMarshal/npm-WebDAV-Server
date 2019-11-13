"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createDir_1 = require("./.createDir");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createDir_1.starter(server, info, isValid, function (r, subFiles, allFiles) {
        server.listResources('/', function (paths) {
            var _loop_1 = function (path) {
                if (path !== '/' && path !== '/folder' && !allFiles.some(function (p) { return '/folder/' + p === path; })) {
                    return { value: isValid(false, 'Cannot find "' + path + '" provided by "server.listResources(...)" in [' + allFiles + ']') };
                }
            };
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var path = paths_1[_i];
                var state_1 = _loop_1(path);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            isValid(true);
        });
    });
});
