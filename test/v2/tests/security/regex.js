"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var safe = require("safe-regex");
exports.default = (function (info, isValid) {
    var options = {
        limit: 25
    };
    var test = function (regex, callback) {
        if (!safe(regex, options)) {
            isValid(false, regex.source);
            callback();
        }
        else {
            isValid(true);
            callback();
        }
    };
    var regexes = [
        /((not)|<([^>]+)>|\[([^\]]+)\]|<(DAV:no-lock)>)/ig,
        /^[ ]*\([ ]*<([^>]+)>[ ]*\)[ ]*$/,
        /(^\/|\/$)/g,
        /(-| )/g,
        /[^a-z0-9A-Z]xml$/,
        /[^a-z0-9A-Z]json$/,
        /([0-9]+)-([0-9]+)/,
        /([0-9]+)-/,
        /-([0-9]+)/,
        /^Basic \s*[a-zA-Z0-9]+=*\s*$/
    ];
    info.expect(regexes.length);
    var index = 0;
    var exec = function () {
        if (index >= regexes.length)
            return;
        test(regexes[index], function () {
            ++index;
            exec();
        });
    };
    exec();
});
