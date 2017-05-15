"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var FSManager_1 = require("../../manager/FSManager");
function default_1(arg, callback) {
    arg.getResource(function (e, r) {
        if (e) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
            callback();
            return;
        }
        var override = arg.findHeader('overwrite') === 'T';
        var destination = arg.findHeader('destination');
        if (!destination) {
            arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
            callback();
            return;
        }
        destination = destination.substring(destination.indexOf('://') + '://'.length);
        destination = destination.substring(destination.indexOf('/'));
        destination = new FSManager_1.FSPath(destination);
        arg.server.getResourceFromPath(destination.getParent(), function (e, rDest) {
            r.moveTo(rDest, destination.fileName(), override, function (e) {
                if (e)
                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                else
                    arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                callback();
            });
        });
    });
}
exports.default = default_1;
