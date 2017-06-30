"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('write in a virtual file', (isValid, server) =>
{
    var files = {
        'testFile1.txt': 'this is the content!',
        'testFile2.txt': new Buffer([ 10, 12, 16, 100, 125, 200, 250 ]),
        'testFile3.txt': new Buffer(100000)
    }

    for(let i = 0; i < files['testFile3.txt'].length; ++i)
        files['testFile3.txt'].write('X', i, 1, 'utf-8');

    isValid = isValid.multiple(Object.keys(files).length, server);
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

        server.rootResource.addChild(file, e => _(e, () => {
            wfs.writeFile('/' + fileName, files[fileName], (e) => _(e, () => {
                wfs.readFile('/' + fileName, (e, content) => {
                    if(e)
                        isValid(false, e)
                    else
                        isValid(content.toString() === files[fileName].toString(), 'Received : "' + content.toString().substring(0, 30) + (content.length > 30 ? '[... ' + content.length + ' more]' : '') + '" but expected : "' + files[fileName].toString().substring(0, 30) + (files[fileName].length > 30 ? '[... ' + files[fileName].length + ' more]' : '') + '"');
                })
            }))
        }));
    }
})