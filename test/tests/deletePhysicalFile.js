var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs"),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('delete a physical file', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    var wfs = Client(
        "http://127.0.0.1:" + (options.port + index)
    );

    const fileName = 'file.txt';
    const filePath = path.join(__dirname, 'deletePhysicalFile', fileName);
    if(!fs.existsSync(filePath))
        fs.writeFileSync(filePath, 'Test!');

    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        wfs.stat('/' + fileName, (e, stat) => {
            if(e)
            {
                isValid(false, e)
                return;
            }
            
            wfs.unlink('/' + fileName, (e) => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                fs.exists(filePath, (exists) => {
                    isValid(!exists)
                })
            })
        })
    });
})