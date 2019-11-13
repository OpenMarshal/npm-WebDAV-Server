"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _createDir_1 = require("./.createDir");
exports.default = (function (info, isValid) {
    var server = info.init(1);
    _createDir_1.starter(server, info, isValid, function (r, subFiles) {
        r.readDir(function (e, sub) {
            if (e)
                return isValid(false, 'Could not call "readDir(...)".', e);
            for (var _i = 0, sub_1 = sub; _i < sub_1.length; _i++) {
                var sf = sub_1[_i];
                var index = subFiles.indexOf(sf);
                if (index === -1)
                    return isValid(false, 'Got a file name in "readDir(...)" which must not exist here : ' + sf);
                delete subFiles[index];
            }
            isValid(subFiles.length > 0, 'All children were not returned ; here are the left ones : ' + subFiles.toString());
        });
    });
});
