var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('stat of virtual file', _isValid =>
{
    var nb = 2;
    var allGood = true;
    var allMsg;
    function isValid(good, msg)
    {
        --nb;
        if(msg && allGood && !good)
            allMsg = msg;
        allGood = allGood && good;
        if(nb === 0)
        {
            server.stop(() => {
                _isValid(allGood, allMsg);
            })
        }
    }

    var server = new webdav.WebDAVServer();
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt', server.rootResource), e => {
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