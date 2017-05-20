var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('lock', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);
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
                    isValid(!e, 'Should be able to write in its own locked file');
                })
            }))
        }))
    }))
})