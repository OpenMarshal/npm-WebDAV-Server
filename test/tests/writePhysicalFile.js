"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('write in a physical file', function(isValid)
{
    var files = {
        'file1.txt': 'this is the content!',
        'file2.txt': new Buffer([ 10, 12, 16, 100, 125, 200, 250 ])
    }

    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(Object.keys(files).length, server);
    const _ = function(e, cb) {
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
        const filePath = path.join(__dirname, 'writePhysicalFile', fileName);
        fs.writeFileSync(filePath, ''); // Clean the file before the test

        server.rootResource.addChild(new webdav.PhysicalFile(filePath), function(e) { _(e, function() {
            wfs.writeFile('/' + fileName, files[fileName], function(e) { _(e, function() {
                wfs.readFile('/' + fileName, function(e, content) {
                    if(e)
                        isValid(false, e)
                    else
                        isValid(content.toString() === files[fileName].toString(), 'Received : ' + content.toString() + ' but expected : ' + files[fileName].toString());
                })
            })})
        })})
    }
})}