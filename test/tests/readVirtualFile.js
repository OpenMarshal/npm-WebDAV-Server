var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('read a virtual file', isValid =>
{
    var files = {
        'testFile1.txt': 'this is the content!',
        'testFile2.txt': null,
        'testFile3.txt': new Buffer([ 10, 12, 16, 100, 125, 200, 250 ]),
        'testFile4.txt': true
    }

    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(Object.keys(files).length + 1, server);

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    for(const fileName in files)
    {
        const file = new webdav.VirtualFile(fileName);
        file.content = files[fileName];

        if(!files[fileName])
            files[fileName] = '';

        server.rootResource.addChild(file, e => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            wfs.readFile('/' + fileName, (e, content) => {
                if(e)
                    isValid(false, e)
                else
                    isValid(content.toString() === files[fileName].toString(), 'Received : ' + content.toString() + ' but expected : ' + files[fileName].toString());
            })
            
        });
    }

    wfs.readFile('/fileNotFound.txt', (e, content) => {
        isValid(!!e)
    })
})