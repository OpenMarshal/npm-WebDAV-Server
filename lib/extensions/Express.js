"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (req.url.indexOf(path) !== 0)
            return next();
        var subPath = req.url.substring(path.length);
        req.url = new Path_1.Path(subPath).toString(false);
        server.executeRequest(req, res, path);
    };
}
exports.express = express;
