"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('read a virtual file', (isValid, server) =>
{
    var files = {
        'testFile1.txt': 'this is the content!',
        'testFile2.txt': null,
        'testFile3.txt': new Buffer([ 10, 12, 16, 100, 125, 200, 250 ]),
        'testFile4.txt': true
    }
    for(const fileName in files)
        if(!files[fileName])
            files[fileName] = '';

    isValid = isValid.multiple(Object.keys(files).length + 1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    for(const fileName in files)
    {
        const file = new webdav.VirtualFile(fileName);
        file.write(true, (e, stream) => _(e, () => stream.end(files[fileName].toString(), (e) => _(e, () => {
            server.rootResource.addChild(file, e => _(e, () => {
                wfs.readFile('/' + fileName, (e, content) => {
                    if(e)
                        isValid(false, e)
                    else
                        isValid(content.toString() === files[fileName].toString(), 'Received : ' + content.toString() + ' but expected : ' + files[fileName].toString());
                })
                
            }));
        }))))
    }

    wfs.readFile('/fileNotFound.txt', (e, content) => {
        isValid(!!e)
    })
})