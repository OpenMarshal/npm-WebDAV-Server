"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = require("../manager/v2/Path");
function express(root, server, options) {
    var path = new Path_1.Path(root).toString(false);
    var pathRegex = new RegExp('^(' + path + ')((\/[^\/]+)*)\/?$');
    return function (req, res, next) {
        var matches = pathRegex.exec(req.url);
        if (!matches)
            return next();
        var root = matches[1];
        var subUrl = matches[2];
        req.url = new Path_1.Path(subUrl).toString(false);
        server.executeRequest(req, res, root);
    };
}
exports.express = express;
