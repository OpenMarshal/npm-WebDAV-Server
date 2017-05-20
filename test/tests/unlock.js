var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('unlock', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.userManager.addUser('usernameX', 'password');
    server.userManager.addUser('usernameX2', 'password2');

    const url = 'http://127.0.0.1:' + (options.port + index);
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

                const lock = body.substr(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, 'urn:uuid:24fa520c-520c-14fa-00d6-0000d546f655'.length);
                
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
})