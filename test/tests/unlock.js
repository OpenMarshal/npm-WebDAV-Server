"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = function(test, options, index) { test('unlock', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(5, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.userManager.addUser('usernameX', 'password');
    server.userManager.addUser('usernameX2', 'password2');

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfsOwner = Client(url, 'usernameX', 'password');
    const wfsNotOwner = Client(url, 'usernameX2', 'password2');
    
    server.rootResource.addChild(new webdav.VirtualFile('test.txt'), function(e) { _(e, function() {
        wfsNotOwner.writeFile('/test.txt', 'Content!', function(e) { _(e, function() {
            request({
                url: url + '/test.txt',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, function(e, res, body) { _(e, function() {
                if(res.statusCode !== 200)
                {
                    isValid(false, res.statusMessage);
                    return;
                }

                const lock = body.substr(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655'.length);
                
                request({
                    url: url + '/test.txt',
                    method: 'UNLOCK',
                    headers: {
                        'Lock-Token': lock === 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655' ? 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f656' : 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655',
                        Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                    }
                }, function(e, res, body) { _(e, function() {
                    if(res.statusCode !== 409)
                    {
                        isValid(false, 'A bad Lock-Token must lead to a 409 Conflict');
                        return;
                    }

                    request({
                        url: url + '/test.txt',
                        method: 'UNLOCK',
                        headers: {
                            'Lock-Token': lock,
                            Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                        }
                    }, function(e, res, body) { _(e, function() {
                        wfsNotOwner.writeFile('/test.txt', 'Content!', function(e) { _(e, function() { isValid(true) }) })
                    })})
                })})
            })})
        })})
    })})

    server.rootResource.addChild(new webdav.VirtualFile('test2.txt'), function(e) { _(e, function() {
        request({
            url: url + '/test2.txt',
            method: 'UNLOCK',
            headers: {
                'Lock-Token': 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655',
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            }
        }, function(e, res, body) { _(e, function() {
            isValid(res.statusCode === 409, 'An UNLOCK request to a not locked resource must lead to a 409 Conflict');
        })})
    })})

    server.rootResource.addChild(new webdav.VirtualFile('test3.txt'), function(e) { _(e, function() {
        request({
            url: url + '/test3.txt',
            method: 'LOCK',
            headers: {
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            },
            body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
        }, function(e, res, body) { _(e, function() {
            const lock = body.substr(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655'.length);
            
            request({
                url: url + '/test3.txt',
                method: 'UNLOCK',
                headers: {
                    'Lock-Token': lock,
                    Authorization: 'Basic dXNlcm5hbWVYMjpwYXNzd29yZDI='
                }
            }, function(e, res, body) { _(e, function() {
                isValid(res.statusCode === 403, 'An UNLOCK request to a resource not locked by the user must lead to a 403 Forbidden');
            })})
        })})
    })})

    server.rootResource.addChild(new webdav.VirtualFile('test4.txt'), function(e) { _(e, function() {
        request({
            url: url + '/test4.txt',
            method: 'LOCK',
            headers: {
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            },
            body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
        }, function(e, res, body) { _(e, function() {
            request({
                url: url + '/test4.txt',
                method: 'UNLOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                }
            }, function(e, res, body) { _(e, function() {
                isValid(res.statusCode === 400, 'An UNLOCK request without Lock-Token header must lead to a 400 Bad Request');
            })})
        })})
    })})

    const fol = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(fol, function(e) { _(e, function() {
        fol.addChild(new webdav.VirtualFile('test5.txt'), function(e) { _(e, function() {
            request({
                url: url + '/testFolder',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, function(e, res, body) { _(e, function() {
                const lock = body.substr(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655'.length);
                
                wfsOwner.writeFile('/testFolder/test5.txt', 'Content!', function(e) { _(e, function() {
                    wfsNotOwner.writeFile('/testFolder/test5.txt', 'Content!', function(e) {
                        if(!e)
                        {
                            isValid(false, 'Must not allow to write in a child resource when the parent is locked');
                            return;
                        }
                        
                        request({
                            url: url + '/testFolder',
                            method: 'UNLOCK',
                            headers: {
                                'Lock-Token': lock,
                                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                            }
                        }, function(e, res, body) { _(e, function() {
                            wfsOwner.writeFile('/testFolder/test5.txt', 'Content!', function(e) { _(e, function() {
                                wfsNotOwner.writeFile('/testFolder/test5.txt', 'Content!', function(e) {
                                    isValid(!e, 'Unlock the parent must unlock the children');
                                })
                            })})
                        })})
                    })
                })})
            })})
        })})
    })})
})}