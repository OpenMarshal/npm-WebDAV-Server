"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IResource_1 = require("../../resource/v1/IResource");
var Errors_1 = require("../../Errors");
var url = require("url");
function NoLock() {
    return function (r, callback) {
        r.getLocks(function (e, locks) {
            if (e === Errors_1.Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, locks ? locks.length === 0 : false);
        });
    };
}
function Token(token) {
    return function (r, callback) {
        r.getLock(token, function (e, lock) {
            if (e === Errors_1.Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, !!lock && !e);
        });
    };
}
function Tag(tag) {
    return function (r, callback) {
        r.lastModifiedDate(function (e, lastModifiedDate) {
            if (e === Errors_1.Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, !e && IResource_1.ETag.createETag(lastModifiedDate) === tag);
        });
    };
}
function Not(filter) {
    return function (r, callback) {
        filter(r, function (e, v) {
            callback(e, !v);
        });
    };
}
function parseInternal(group) {
    var rex = /((not)|<([^>]+)>|\[([^\]]+)\]|<(DAV:no-lock)>)/ig;
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
        else if (match[3]) { // lock-token
            add(Token(match[3]));
        }
        else if (match[4]) { // tag
            add(Tag(match[4]));
        }
        else if (match[5]) { // DAV:no-lock
            add(NoLock());
        }
        match = rex.exec(group);
    }
    if (andArray.length)
        return function (r, callback) { return callback(null, true); };
    return function (r, callback) {
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
        andArray.forEach(function (a) { return a(r, done); });
    };
}
function extractOneToken(ifHeader) {
    var match = /^[ ]*\([ ]*<([^>]+)>[ ]*\)[ ]*$/.exec(ifHeader);
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
    if (orArray.length)
        return function (arg, r, callback) { return callback(null, true); };
    return function (arg, r, callback) {
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
                a.actions(r, done);
            else
                arg.server.getResourceFromPath(arg, a.path, function (e, resource) {
                    if (e)
                        done(e, null);
                    else
                        a.actions(resource, done);
                });
        });
    };
}
exports.parseIfHeader = parseIfHeader;
