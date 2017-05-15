var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    request = require('request')

module.exports = (test, options, index) => test('stat of virtual resources', isValid =>
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);

    const content = 'Content!!!';

    const folder = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(folder, e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        const file = new webdav.VirtualFile('testFile.txt');
        file.content = content;
        folder.addChild(file, e => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            server.start(options.port + index);

            var wfs = Client(
                "http://127.0.0.1:" + (options.port + index)
            );

            wfs.stat('/testFolder/testFile.txt', (e, stat) => {
                isValid(!e && stat.name === 'testFile.txt' && stat.size === content.length && stat.isFile(), 'File error');
            })

            wfs.stat('/testFolder', (e, stat) => {
                isValid(!e && stat.isDirectory(), 'Folder error');
            })

            wfs.stat('/notFoundFile.txt', (e, stat) => {
                isValid(!!e);
            })
        });
    });
})