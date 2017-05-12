var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('make a folder', _isValid =>
{
    var nb = 3;
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
        
        wfs.mkdir('/testFile.txt/testFail', (e, content) => {
            isValid(!!e)
        })

        wfs.mkdir('/undefined/testFail', (e, content) => {
            isValid(!!e)
        })

        wfs.mkdir('/testSuccess', (e, content) => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            wfs.mkdir('/testSuccess/testSuccess2', (e, content) => {
                if(e)
                    isValid(false, e)
                else
                    isValid(true);
            })
        })
    });
})