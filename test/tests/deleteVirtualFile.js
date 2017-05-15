var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('delete a virtual file', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const fileName = 'file.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), e => {
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

                wfs.stat('/' + fileName, (e, stat) => {
                    isValid(!!e)
                })
            })
        })
    });

    wfs.unlink('/fileNotFound.txt', (e) => {
        isValid(!!e)
    })
})