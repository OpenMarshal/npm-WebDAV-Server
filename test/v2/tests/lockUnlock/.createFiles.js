"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function methodTesterNotBlocking(info, isValid, callbackLocked) {
    var server1 = info.init(3);
    starter(server1, info, isValid, 'folder/folder2/folder3/folder4/file', 0, true, function (lock, user1, user2) {
        callbackLocked(server1.options.port, user2, function () {
            isValid(true);
        });
    });
    var server2 = info.startServer();
    starter(server2, info, isValid, 'folder', -1, true, function (lock, user1, user2) {
        callbackLocked(server2.options.port, user2, function () {
            isValid(true);
        });
    });
    var server3 = info.startServer();
    starter(server3, info, isValid, 'folder/folder2/folder3/folder4', 1, true, function (lock, user1, user2) {
        callbackLocked(server3.options.port, user2, function () {
            isValid(true);
        });
    });
}
exports.methodTesterNotBlocking = methodTesterNotBlocking;
function methodTesterBlocking(info, isValid, callbackLocked, callbackUnlocked, isFolder) {
    isFolder = isFolder === undefined ? false : isFolder;
    var server1 = info.init(2 + (isFolder ? 0 : 1));
    if (!isFolder) {
        starter(server1, info, isValid, 'folder/folder2/folder3/folder4/file', 0, true, function (lock, user1, user2) {
            callbackLocked(server1.options.port, user1, user2, function () {
                if (!callbackUnlocked)
                    return isValid(true);
                unlockResource(server1, info, isValid, user1, 'folder/folder2/folder3/folder4/file', lock.uuid, function () {
                    callbackUnlocked(server1.options.port, user2);
                });
            });
        });
    }
    var server2 = info.startServer();
    starter(server2, info, isValid, 'folder', -1, true, function (lock, user1, user2) {
        callbackLocked(server2.options.port, user1, user2, function () {
            if (!callbackUnlocked)
                return isValid(true);
            unlockResource(server2, info, isValid, user1, 'folder', lock.uuid, function () {
                callbackUnlocked(server2.options.port, user2);
            });
        });
    });
    var server3 = info.startServer();
    starter(server3, info, isValid, 'folder/folder2/folder3/folder4', 1, true, function (lock, user1, user2) {
        callbackLocked(server3.options.port, user1, user2, function () {
            if (!callbackUnlocked)
                return isValid(true);
            unlockResource(server3, info, isValid, user1, 'folder/folder2/folder3/folder4', lock.uuid, function () {
                callbackUnlocked(server3.options.port, user2);
            });
        });
    });
}
exports.methodTesterBlocking = methodTesterBlocking;
function unlockResource(server, info, isValid, user, pathNameToUnlock, lockToken, _expectedResponseCode, _callback) {
    var expectedResponseCode = _callback ? _expectedResponseCode : index_js_1.v2.HTTPCodes.NoContent;
    var callback = _callback ? _callback : _expectedResponseCode;
    info.req({
        url: 'http://localhost:' + server.options.port + '/' + pathNameToUnlock,
        method: 'UNLOCK',
        headers: {
            'Lock-Token': '<' + lockToken + '>',
            Authorization: 'Basic ' + user
        }
    }, expectedResponseCode, function () {
        callback();
    });
}
exports.unlockResource = unlockResource;
function lockResource(server, info, isValid, user, pathNameToLock, depth, isExclusive, _expectedResponseCode, _callback) {
    var expectedResponseCode = _callback ? _expectedResponseCode : index_js_1.v2.HTTPCodes.OK;
    var callback = _callback ? _callback : _expectedResponseCode;
    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + pathNameToLock,
        method: 'LOCK',
        headers: {
            Depth: depth === -1 ? 'Infinity' : depth.toString(),
            Authorization: 'Basic ' + user
        },
        body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:' + (isExclusive ? 'exclusive' : 'shared') + '/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>http://example.org/~ejw/contact.html</D:href></D:owner></D:lockinfo>'
    }, expectedResponseCode, function (res, xml) {
        if (expectedResponseCode !== index_js_1.v2.HTTPCodes.Created && expectedResponseCode !== index_js_1.v2.HTTPCodes.OK)
            return callback(null);
        try {
            var activeLock = xml.find('DAV:prop').find('DAV:lockdiscovery').find('DAV:activelock');
            var sDepth = activeLock.find('DAV:depth').findText().trim().toLowerCase();
            var sTimeout = activeLock.find('DAV:timeout').findText();
            var lock = {
                scope: activeLock.find('DAV:lockscope').elements[0].name.replace('DAV:', '').toLowerCase(),
                type: activeLock.find('DAV:locktype').elements[0].name.replace('DAV:', '').toLowerCase(),
                depth: sDepth === 'infinity' ? -1 : parseInt(sDepth, 10),
                owner: activeLock.find('DAV:owner').elements,
                timeoutSec: parseInt(sTimeout.substring(sTimeout.indexOf(':') + 1), 10),
                uuid: activeLock.find('DAV:locktoken').find('DAV:href').findText(),
                root: activeLock.find('DAV:lockroot').find('DAV:href').findText()
            };
            if (lock.type !== 'write')
                return isValid(false, 'The lock type must be write when requested to be write.', lock.type);
            if (isExclusive && lock.scope !== 'exclusive')
                return isValid(false, 'The lock scope must be exclusive when requested to be exclusive.', lock.scope);
            if (!isExclusive && lock.scope !== 'shared')
                return isValid(false, 'The lock scope must be shared when requested to be shared.', lock.scope);
            try {
                if (lock.owner[0].findText() !== 'http://example.org/~ejw/contact.html')
                    return isValid(false, 'The value of the owner is not perfectly saved.');
            }
            catch (ex) {
                return isValid(false, 'The owner property is not valid.', ex);
            }
            callback(lock);
        }
        catch (ex) {
            return isValid(false, 'The WebDAV XML response is not valid.', ex);
        }
    });
}
exports.lockResource = lockResource;
function starter(server, info, isValid, pathNameToLock, depth, isExclusive, _expectedResponseCode, _callback) {
    var expectedResponseCode = _callback ? _expectedResponseCode : index_js_1.v2.HTTPCodes.OK;
    var callback = _callback ? _callback : _expectedResponseCode;
    var um = new index_js_1.v2.SimpleUserManager();
    um.addUser('user1', 'password1');
    um.addUser('user2', 'password2');
    server.httpAuthentication = new index_js_1.v2.HTTPBasicAuthentication(um, 'Test realm');
    server.options.httpAuthentication = server.httpAuthentication;
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'folder': {
            'folder2': {
                'folder3': {
                    'folder4': {
                        'file': index_js_1.v2.ResourceType.File
                    }
                }
            }
        },
        'file': index_js_1.v2.ResourceType.File,
        'hybrid': index_js_1.v2.ResourceType.Hybrid,
        'noResource': index_js_1.v2.ResourceType.NoResource,
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        lockResource(server, info, isValid, 'dXNlcjE6cGFzc3dvcmQx', pathNameToLock, depth, isExclusive, expectedResponseCode, function (lock) {
            callback(lock, 'dXNlcjE6cGFzc3dvcmQx', 'dXNlcjI6cGFzc3dvcmQy');
        });
    });
}
exports.starter = starter;
