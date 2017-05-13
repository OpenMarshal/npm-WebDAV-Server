var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('write/create a virtual file', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    var wfs = Client(
        "http://127.0.0.1:" + (options.port + index)
    );

    const fileName = 'file.txt';
    wfs.writeFile('/' + fileName, new Buffer(0), (e) => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        wfs.stat('/' + fileName, (e) => {
            isValid(!e)
        })
    })
})