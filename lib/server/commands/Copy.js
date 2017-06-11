"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVRequest_1 = require("../WebDAVRequest");
var FSManager_1 = require("../../manager/FSManager");
function copyAllProperties(source, destination, callback) {
    source.getProperties(function (e, props) {
        if (e) {
            callback(e);
            return;
        }
        var nb = Object.keys(props).length;
        function go(error) {
            if (nb <= 0)
                return;
            if (error) {
                nb = -1;
                callback(error);
                return;
            }
            --nb;
            if (nb === 0)
                callback(null);
        }
        if (nb === 0) {
            callback(null);
            return;
        }
        for (var name_1 in props) {
            if (nb <= 0)
                break;
            destination.setProperty(name_1, JSON.parse(JSON.stringify(props[name_1])), go);
        }
    });
}
function copy(arg, source, rDest, destination, callback) {
    function _(error, cb) {
        if (error)
            process.nextTick(function () { return callback(error); });
        else
            process.nextTick(cb);
    }
    arg.requirePrivilege(['canGetType', 'canRead', 'canGetChildren', 'canGetProperties'], source, function () {
        arg.requirePrivilege(['canAddChild'], rDest, function () {
            source.type(function (e, type) { return _(e, function () {
                var dest = rDest.fsManager.newResource(destination.toString(), destination.fileName(), type, rDest);
                arg.requirePrivilege(['canCreate', 'canSetProperty', 'canWrite'], dest, function () {
                    dest.create(function (e) { return _(e, function () {
                        arg.invokeEvent('create', dest);
                        rDest.addChild(dest, function (e) { return _(e, function () {
                            arg.invokeEvent('addChild', rDest, dest);
                            copyAllProperties(source, dest, function (e) { return _(e, function () {
                                if (!type.isFile) {
                                    next();
                                    return;
                                }
                                source.read(true, function (e, rstream) { return _(e, function () {
                                    dest.write(true, function (e, wstream) { return _(e, function () {
                                        rstream.on('end', function () {
                                            arg.invokeEvent('read', source);
                                            next();
                                        });
                                        wstream.on('finish', function () {
                                            arg.invokeEvent('write', dest);
                                        });
                                        rstream.pipe(wstream);
                                    }); });
                                }); });
                                function next() {
                                    if (!type.isDirectory) {
                                        arg.invokeEvent('copy', source, dest);
                                        callback(null);
                                        return;
                                    }
                                    source.getChildren(function (e, children) { return _(e, function () {
                                        var nb = children.length;
                                        function done(error) {
                                            if (nb <= 0)
                                                return;
                                            if (error) {
                                                nb = -1;
                                                callback(e);
                                                return;
                                            }
                                            --nb;
                                            if (nb === 0) {
                                                arg.invokeEvent('copy', source, dest);
                                                callback(null);
                                            }
                                        }
                                        if (nb === 0) {
                                            callback(null);
                                            arg.invokeEvent('copy', source, dest);
                                            return;
                                        }
                                        children.forEach(function (child) {
                                            child.webName(function (e, name) { return process.nextTick(function () {
                                                if (e)
                                                    done(e);
                                                else
                                                    copy(arg, child, dest, destination.getChildPath(name), done);
                                            }); });
                                        });
                                    }); });
                                }
                            }); });
                        }); });
                    }); });
                });
            }); });
        });
    });
}
function default_1(arg, callback) {
    arg.noBodyExpected(function () {
        arg.getResource(function (e, source) {
            if (e) {
                arg.setCode(WebDAVRequest_1.HTTPCodes.NotFound);
                callback();
                return;
            }
            arg.checkIfHeader(source, function () {
                var overwrite = arg.findHeader('overwrite') !== 'F';
                var destination = arg.findHeader('destination');
                if (!destination) {
                    arg.setCode(WebDAVRequest_1.HTTPCodes.BadRequest);
                    callback();
                    return;
                }
                var startIndex = destination.indexOf('://');
                if (startIndex !== -1) {
                    destination = destination.substring(startIndex + '://'.length);
                    destination = destination.substring(destination.indexOf('/'));
                }
                destination = new FSManager_1.FSPath(destination);
                arg.server.getResourceFromPath(destination.getParent(), function (e, rDest) {
                    if (e) {
                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }
                    arg.requirePrivilege(['canGetType'], source, function () {
                        arg.requirePrivilege(['canGetChildren'], rDest, function () {
                            source.type(function (e, type) { return process.nextTick(function () {
                                if (e) {
                                    arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                    callback();
                                    return;
                                }
                                function done(overridded) {
                                    copy(arg, source, rDest, destination, function (e) {
                                        if (e)
                                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                        else if (overridded)
                                            arg.setCode(WebDAVRequest_1.HTTPCodes.NoContent);
                                        else
                                            arg.setCode(WebDAVRequest_1.HTTPCodes.Created);
                                        callback();
                                    });
                                }
                                var nb = 0;
                                function go(error, destCollision) {
                                    if (nb <= 0)
                                        return;
                                    if (error) {
                                        nb = -1;
                                        arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                        callback();
                                        return;
                                    }
                                    if (destCollision) {
                                        nb = -1;
                                        if (!overwrite) {
                                            arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                            callback();
                                            return;
                                        }
                                        destCollision.type(function (e, destType) { return process.nextTick(function () {
                                            if (e) {
                                                callback(e);
                                                return;
                                            }
                                            if (destType !== type) {
                                                arg.setCode(WebDAVRequest_1.HTTPCodes.InternalServerError);
                                                callback();
                                                return;
                                            }
                                            destCollision.delete(function (e) { return process.nextTick(function () {
                                                if (e) {
                                                    callback(e);
                                                    return;
                                                }
                                                arg.invokeEvent('delete', destCollision);
                                                done(true);
                                            }); });
                                        }); });
                                        return;
                                    }
                                    --nb;
                                    if (nb === 0) {
                                        done(false);
                                    }
                                }
                                rDest.getChildren(function (e, children) { return process.nextTick(function () {
                                    if (e) {
                                        go(e, null);
                                        return;
                                    }
                                    nb += children.length;
                                    if (nb === 0) {
                                        done(false);
                                        return;
                                    }
                                    children.forEach(function (child) {
                                        child.webName(function (e, name) { return process.nextTick(function () {
                                            go(e, name === destination.fileName() ? child : null);
                                        }); });
                                    });
                                }); });
                            }); });
                        });
                    });
                });
            });
        });
    });
}
exports.default = default_1;
