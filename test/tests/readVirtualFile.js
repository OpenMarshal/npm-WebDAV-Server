var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('read a virtual file', _isValid =>
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
    
    var testValue = 'this is the content!';

    var server = new webdav.WebDAVServer();
    var file = new webdav.VirtualFile('testFile.txt');
    file.content = testValue;
    server.rootResource.addChild(file, e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        server.start(options.port + index);

        var wfs = Client(
            "http://127.0.0.1:" + (options.port + index)
        );

        wfs.readFile('/testFile.txt', (e, content) => {
            if(e)
                isValid(false, e)
            else
                isValid(content.toString() === testValue);
        })
        
        wfs.readFile('/fileNotFound.txt', (e, content) => {
            isValid(!!e)
        })
    });
})