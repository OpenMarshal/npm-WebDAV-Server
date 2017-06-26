"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('unlock', (isValid, server) =>
{
    isValid = isValid.multiple(5, server);
    const _ = (e, cb) => {
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
    
    server.rootResource.addChild(new webdav.VirtualFile('test.txt'), e => _(e, () => {
        wfsNotOwner.writeFile('/test.txt', 'Content!', (e) => _(e, () => {
            request({
                url: url + '/test.txt',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, (e, res, body) => _(e, () => {
                if(res.statusCode !== 200)
                {
                    isValid(false, res.statusMessage);
                    return;
                }

                const lock = body.substring(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, body.indexOf('</D:href>', body.indexOf('<D:locktoken><D:href>')));
                
                request({
                    url: url + '/test.txt',
                    method: 'UNLOCK',
                    headers: {
                        'Lock-Token': lock === 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655' ? 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f656' : 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655',
                        Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                    }
                }, (e, res, body) => _(e, () => {
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
                    }, (e, res, body) => _(e, () => {
                        wfsNotOwner.writeFile('/test.txt', 'Content!', (e) => _(e, () => isValid(true)))
                    }))
                }))
            }))
        }))
    }))

    server.rootResource.addChild(new webdav.VirtualFile('test2.txt'), e => _(e, () => {
        request({
            url: url + '/test2.txt',
            method: 'UNLOCK',
            headers: {
                'Lock-Token': 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655',
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            }
        }, (e, res, body) => _(e, () => {
            isValid(res.statusCode === 409, 'An UNLOCK request to a not locked resource must lead to a 409 Conflict');
        }))
    }))

    server.rootResource.addChild(new webdav.VirtualFile('test3.txt'), e => _(e, () => {
        request({
            url: url + '/test3.txt',
            method: 'LOCK',
            headers: {
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            },
            body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
        }, (e, res, body) => _(e, () => {
            const lock = body.substring(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, body.indexOf('</D:href>', body.indexOf('<D:locktoken><D:href>')));
            
            request({
                url: url + '/test3.txt',
                method: 'UNLOCK',
                headers: {
                    'Lock-Token': lock,
                    Authorization: 'Basic dXNlcm5hbWVYMjpwYXNzd29yZDI='
                }
            }, (e, res, body) => _(e, () => {
                isValid(res.statusCode === 403, 'An UNLOCK request to a resource not locked by the user must lead to a 403 Forbidden');
            }))
        }))
    }))

    server.rootResource.addChild(new webdav.VirtualFile('test4.txt'), e => _(e, () => {
        request({
            url: url + '/test4.txt',
            method: 'LOCK',
            headers: {
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            },
            body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
        }, (e, res, body) => _(e, () => {
            request({
                url: url + '/test4.txt',
                method: 'UNLOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                }
            }, (e, res, body) => _(e, () => {
                isValid(res.statusCode === 400, 'An UNLOCK request without Lock-Token header must lead to a 400 Bad Request');
            }))
        }))
    }))

    const fol = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(fol, e => _(e, () => {
        fol.addChild(new webdav.VirtualFile('test5.txt'), e => _(e, () => {
            request({
                url: url + '/testFolder',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, (e, res, body) => _(e, () => {
                const lock = body.substring(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, body.indexOf('</D:href>', body.indexOf('<D:locktoken><D:href>')));
                
                wfsOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => _(e, () => {
                    wfsNotOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => {
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
                        }, (e, res, body) => _(e, () => {
                            wfsOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => _(e, () => {
                                wfsNotOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => {
                                    isValid(!e, 'Unlock the parent must unlock the children');
                                })
                            }))
                        }))
                    })
                }))
            }))
        }))
    }))
})