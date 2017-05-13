var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('stat of virtual file', isValid =>
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        server.start(options.port + index);

        var wfs = Client(
            "http://127.0.0.1:" + (options.port + index)
        );

        wfs.stat('/testFile.txt', (e, stat) => {
            isValid(!e && stat.name === 'testFile.txt');
        })

        wfs.stat('/notFoundFile.txt', (e, stat) => {
            isValid(!!e);
        })
    });
})