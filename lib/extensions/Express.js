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
    var path = new Path_1.Path(root).toString(false);
    var pathRegex = new RegExp('^' + path + '((\/[^\/]+)*)\/?$');
    return function (req, res, next) {
        var matches = pathRegex.exec(req.url);
        if (!matches)
            return next();
        var subUrl = matches[1];
        req.url = new Path_1.Path(subUrl).toString(false);
        server.executeRequest(req, res, path);
    };
}
exports.express = express;
