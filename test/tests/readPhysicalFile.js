var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs"),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('read a physical file', _isValid =>
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
    server.start(options.port + index);

    var wfs = Client(
        "http://127.0.0.1:" + (options.port + index)
    );

    const fileName = 'file.txt';
    const filePath = path.join(__dirname, 'readPhysicalFile', fileName);
    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        wfs.readFile('/' + fileName, (e, content) => {
            if(e)
                isValid(false, e)
            else
                isValid(content.toString() === fs.readFileSync(filePath).toString());
        })
    });
    
    const folderName = 'readPhysicalFile';
    const folderPath = path.join(__dirname, folderName);
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        wfs.readFile('/' + folderName, (e, content) => {
            isValid(!!e)
        })
    });
})