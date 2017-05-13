var webdav = require('../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('HEAD method', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);

    request({
        url: 'http://localhost:' + (options.port + index),
        method: 'HEAD'
    }, (e, res, body) => {
        isValid(!e && res.statusCode !== 200);
    })

    server.rootResource.addChild(new webdav.VirtualFile('file'), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }
        
        request({
            url: 'http://localhost:' + (options.port + index) + '/file',
            method: 'HEAD'
        }, (e, res, body) => {
            isValid(!e && res.statusCode === 200);
        })
    })
})