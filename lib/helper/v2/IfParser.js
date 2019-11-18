"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = require("../../manager/v2/Path");
var url = require("url");
function NoLock() {
    return function (resource, callback) {
        resource.lockManager(function (e, lm) {
            if (e)
                return callback(e, false);
            lm.getLocks(function (e, locks) {
                callback(e, locks ? locks.length === 0 : false);
            });
        });
    };
}
function Token(token) {
    return function (resource, callback) {
        resource.lockManager(function (e, lm) {
            if (e)
                return callback(e, false);
            lm.getLock(token, function (e, lock) { return callback(e, !!lock && !e); });
        });
    };
}
function Tag(tag) {
    return function (resource, callback) {
        resource.etag(function (e, etag) { return callback(e, !e && etag === tag); });
    };
}
function Not(filter) {
    return function (resource, callback) {
        filter(resource, function (e, v) {
            callback(e, !v);
        });
    };
}
function parseInternal(group) {
    var rex = /((not)|\[([^\]]+)\]|<(DAV:no-lock)>|<([^>]+)>|([^\s]+))/ig;
    var match = rex.exec(group);
    var isNot = false;
    var andArray = [];
    function add(filter) {
        andArray.push(isNot ? Not(filter) : filter);
        isNot = false;
    }
    while (match) {
        if (match[2]) { // not
            isNot = true;
        }
        else if (match[5] || match[6]) { // lock-token
            add(Token(match[5] || match[6]));
        }
        else if (match[3]) { // tag
            add(Tag(match[3]));
        }
        else if (match[4]) { // DAV:no-lock
            add(NoLock());
        }
        match = rex.exec(group);
    }
    if (andArray.length)
        return function (r, callback) { return callback(null, true); };
    return function (resource, callback) {
        var nb = andArray.length;
        function done(error, result) {
            if (nb <= 0)
                return;
            if (error) {
                nb = -1;
                callback(error, false);
                return;
            }
            --nb;
            if (nb === 0 || !result) {
                nb = -1;
                callback(null, result);
            }
        }
        andArray.forEach(function (a) { return a(resource, done); });
    };
}
function extractOneToken(ifHeader) {
    var match = /^\s*\(\s*<?([^\)\s>]+)>?\s*\)\s*$/.exec(ifHeader);
    if (!match)
        return null;
    else
        return match[1];
}
exports.extractOneToken = extractOneToken;
function parseIfHeader(ifHeader) {
    var rex = /(?:<([^>]+)>)?\s*\(([^\)]+)\)/g;
    var match = rex.exec(ifHeader);
    var orArray = [];
    var oldPath = undefined;
    while (match) {
        if (match[1])
            oldPath = url.parse(match[1]).path;
        orArray.push({
            path: oldPath,
            actions: parseInternal(match[2])
        });
        match = rex.exec(ifHeader);
    }
    if (orArray.length === 0)
        return function (ctx, resource, callback) { return callback(null, true); };
    return function (ctx, resource, callback) {
        var nb = orArray.length;
        function done(error, result) {
            if (nb <= 0)
                return;
            if (error) {
                nb = -1;
                callback(error, false);
                return;
            }
            --nb;
            if (nb === 0 || result) {
                nb = -1;
                callback(null, result);
            }
        }
        orArray.forEach(function (a) {
            if (!a.path)
                a.actions(resource, done);
            else {
                var sPath_1 = new Path_1.Path(a.path);
                ctx.server.getFileSystem(sPath_1, function (fs, _, sub) {
                    a.actions(fs.resource(ctx, sPath_1), done);
                });
            }
        });
    };
}
exports.parseIfHeader = parseIfHeader;
