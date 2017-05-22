"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('lock', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(6, server);
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
                
                wfsNotOwner.writeFile('/test.txt', 'Content!', (e) => {
                    isValid(!!e, 'Should not be able to write in a locked file');
                })
            }))
        }))
    }))
    
    server.rootResource.addChild(new webdav.VirtualFile('test2.txt'), e => _(e, () => {
        wfsOwner.writeFile('/test2.txt', 'Content!', (e) => _(e, () => {
            request({
                url: url + '/test2.txt',
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
                
                wfsOwner.writeFile('/test2.txt', 'Content!', (e) => {
                    isValid(!e, 'Could not write in its own locked file');
                })
            }))
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
            if(res.statusCode !== 200)
            {
                isValid(false, 'LOCK on a locked resource must lead to a 200 OK');
                return;
            }

            request({
                url: url + '/test3.txt',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, (e, res, body) => _(e, () => {
                isValid(res.statusCode === 423, 'LOCK on a locked resource must lead to a 423 Locked');
            }))
        }))
    }))
    /*
    server.rootResource.addChild(new webdav.VirtualFile('test4.txt'), e => _(e, () => {
        request({
            url: url + '/test4.txt',
            method: 'LOCK',
            headers: {
                Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
            },
            body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
        }, (e, res, body) => _(e, () => {
            const lock = body.substr(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655'.length);
            
            request({
                url: url + '/test4.txt',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, (e, res, body) => _(e, () => {
                if(res.statusCode !== 412)
                {
                    isValid(res.statusCode === 412, 'LOCK on a locked resource without a proper If header must lead to a 412 Precondition Failed');
                    return;
                }

                request({
                    url: url + '/test4.txt',
                    method: 'LOCK',
                    headers: {
                        If: '(<' + lock + '>)',
                        Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                    },
                    body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
                }, (e, res, body) => _(e, () => {
                    isValid(res.statusCode === 200, 'LOCK on a locked resource with a If header in order to refresh the lock must lead to a 200 OK');
                }))
            }))
        }))
    }))*/
    
    request({
        url: url + '/testDoesNotExist.txt',
        method: 'LOCK',
        headers: {
            Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
        },
        body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
    }, (e, res, body) => _(e, () => {
        isValid(res.statusCode === 201, 'LOCK on an unexisting resource must lead to a 201 Created');
    }))
    
    request({
        url: url + '/folderDoestNotExist/testDoesNotExist.txt',
        method: 'LOCK',
        headers: {
            Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
        },
        body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
    }, (e, res, body) => _(e, () => {
        isValid(res.statusCode === 409, 'LOCK on an unexisting resource with not existing parent must lead to a 409 Conflict');
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
                wfsOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => _(e, () => {
                    wfsNotOwner.writeFile('/testFolder/test5.txt', 'Content!', (e) => {
                        isValid(!!e, 'Must not allow to write in a child resource when the parent is locked');
                    })
                }))
            }))
        }))
    }))
})