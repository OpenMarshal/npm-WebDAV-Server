"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var CommonTypes_1 = require("../../../manager/v2/fileSystem/CommonTypes");
var IfParser_1 = require("../../../helper/v2/IfParser");
var LockScope_1 = require("../../../resource/v2/lock/LockScope");
var LockKind_1 = require("../../../resource/v2/lock/LockKind");
var LockType_1 = require("../../../resource/v2/lock/LockType");
var Errors_1 = require("../../../Errors");
var Lock_1 = require("../../../resource/v2/lock/Lock");
var xml_js_builder_1 = require("xml-js-builder");
function createResponse(ctx, lock) {
    var prop = new xml_js_builder_1.XMLElementBuilder('D:prop', {
        'xmlns:D': 'DAV:'
    });
    var activelock = prop.ele('D:lockdiscovery').ele('D:activelock');
    activelock.ele('D:locktype').ele(lock.lockKind.type.value);
    activelock.ele('D:lockscope').ele(lock.lockKind.scope.value);
    activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid);
    activelock.ele('D:lockroot').ele('D:href', undefined, true).add(WebDAVRequest_1.HTTPRequestContext.encodeURL(ctx.fullUri()));
    activelock.ele('D:depth').add(lock.depth === -1 ? 'infinity' : lock.depth.toString());
    if (lock.owner)
        activelock.ele('D:owner').add(lock.owner);
    activelock.ele('D:timeout').add("Second-" + lock.lockKind.timeout);
    return prop;
}
function createLock(ctx, data, callback) {
    try {
        var xml = xml_js_builder_1.XML.parse(data);
        var root = xml.find('DAV:lockinfo');
        var scope = new LockScope_1.LockScope(root.find('DAV:lockscope').elements[0].name.substr(4).toLowerCase());
        var type_1 = new LockType_1.LockType(root.find('DAV:locktype').elements[0].name.substr(4).toLowerCase());
        var ownerElementIndex = root.findIndex('DAV:owner');
        var owner = ownerElementIndex !== -1 ? root.elements[ownerElementIndex].elements : null;
        var lock_1 = new Lock_1.Lock(new LockKind_1.LockKind(scope, type_1, ctx.server.options.lockTimeout), ctx.user ? ctx.user.uid : undefined, owner, ctx.headers.depth === undefined ? -1 : ctx.headers.depth);
        var go_1 = function (r, callback) {
            ctx.overridePrivileges = true;
            r.listDeepLocks(function (e, locks) {
                ctx.overridePrivileges = false;
                if (e)
                    return callback(e);
                if (Object.keys(locks).length > 0) {
                    if (LockScope_1.LockScope.Exclusive.isSame(type_1))
                        return callback(Errors_1.Errors.Locked);
                    for (var path in locks)
                        if (locks[path].some(function (l) { return LockScope_1.LockScope.Exclusive.isSame(l.lockKind.scope); }))
                            return callback(Errors_1.Errors.Locked);
                }
                r.lockManager(function (e, lm) {
                    if (e)
                        return callback(e);
                    lm.setLock(lock_1, function (e) {
                        if (e)
                            return callback(e);
                        //ctx.invokeEvent('lock', r, lock);
                        ctx.response.setHeader('Lock-Token', lock_1.uuid);
                        callback();
                    });
                });
            });
        };
        var _callback_1 = callback;
        callback = function (e) {
            if (e) {
                if (!ctx.setCodeFromError(e))
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
            }
            else
                ctx.writeBody(createResponse(ctx, lock_1));
            _callback_1();
        };
        ctx.getResource(function (e, r) {
            go_1(r, function (e) {
                if (e === Errors_1.Errors.ResourceNotFound)
                    r.create(CommonTypes_1.ResourceType.File, function (e) {
                        if (e)
                            return callback(e);
                        ctx.setCode(WebDAVRequest_1.HTTPCodes.Created);
                        go_1(r, callback);
                    });
                else if (e)
                    callback(e);
                else
                    callback();
            });
        });
    }
    catch (ex) {
        ctx.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
        callback();
        return;
    }
}
function refreshLock(ctx, lockUUID, callback) {
    ctx.getResource(function (e, r) {
        //ctx.requirePrivilege([ 'canSetLock', 'canGetLock' ], r, () => {
        r.lockManager(function (e, lm) {
            if (e) {
                if (!ctx.setCodeFromError(e))
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                return callback();
            }
            lm.refresh(lockUUID, ctx.server.options.lockTimeout, function (e, lock) {
                if (e || !lock) {
                    ctx.setCode(WebDAVRequest_1.HTTPCodes.PreconditionFailed);
                    callback();
                    return;
                }
                //ctx.invokeEvent('refreshLock', r, lock);
                ctx.setCode(WebDAVRequest_1.HTTPCodes.OK);
                ctx.writeBody(createResponse(ctx, lock));
                callback();
            });
        });
        //})
    });
}
var default_1 = /** @class */ (function () {
    function default_1() {
    }
    default_1.prototype.unchunked = function (ctx, data, callback) {
        if (!ctx.user) {
            ctx.setCode(WebDAVRequest_1.HTTPCodes.Forbidden);
            return callback();
        }
        if (ctx.headers.contentLength > 0) {
            createLock(ctx, data, callback);
            return;
        }
        var ifHeader = ctx.headers.find('If');
        if (!ifHeader) {
            ctx.setCode(WebDAVRequest_1.HTTPCodes.PreconditionRequired);
            return callback();
        }
        refreshLock(ctx, IfParser_1.extractOneToken(ifHeader), callback);
    };
    return default_1;
}());
exports.default = default_1;
