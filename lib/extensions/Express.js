"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSCompatibility_1 = require("../helper/JSCompatibility");
var Path_1 = require("../manager/v2/Path");
/**
 * Mount a WebDAVServer instance on a ExpressJS server.
 *
 * @param root Root path of the mount
 * @param server Server to mount
 */
function express(root, server) {
    var path = new Path_1.Path(root).toString(true);
    return function (req, res, next) {
        var url = req.url;
        if (url[url.length - 1] !== '/')
            url += '/';
        if (!JSCompatibility_1.startsWith(url, path))
            return next();
        var subPath = url.substring(path.length);
        req.url = new Path_1.Path(subPath).toString(false);
        server.executeRequest(req, res, path);
    };
}
exports.express = express;
