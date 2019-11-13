"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
exports.default = (function (info, isValid) {
    var server1 = info.init(1);
    _createFiles_1.starter(server1, info, isValid, 'file', 0, true, function (lock, user1, user2) {
        _createFiles_1.unlockResource(server1, info, isValid, user2, 'file', lock.uuid, index_js_1.v2.HTTPCodes.Forbidden, function () {
            _createFiles_1.unlockResource(server1, info, isValid, user1, 'file', lock.uuid, index_js_1.v2.HTTPCodes.NoContent, function () {
                _createFiles_1.unlockResource(server1, info, isValid, user1, 'file', lock.uuid, index_js_1.v2.HTTPCodes.Conflict, function () {
                    isValid(true);
                });
            });
        });
    });
});
