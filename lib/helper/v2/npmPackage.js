"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var pkg = undefined;
function getPackageData(callback) {
    if (pkg) {
        callback(undefined, pkg);
        return;
    }
    var packagePath = path.resolve(path.join(__dirname, '..', '..', '..', 'package.json'));
    fs.readFile(packagePath, function (e, data) {
        try {
            if (e)
                throw e;
            if (data) {
                pkg = JSON.parse(data.toString());
                callback(undefined, pkg);
            }
        }
        catch (ex) {
            callback(ex);
        }
    });
}
exports.getPackageData = getPackageData;
