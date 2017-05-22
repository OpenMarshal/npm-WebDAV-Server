"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = function(test, options, index) { test('stat of virtual resources', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const content = 'Content!!!';

    const folder = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(folder, function(e) { _(e, function() {
        const file = new webdav.VirtualFile('testFile.txt');
        file.content = content;
        folder.addChild(file, function(e) { _(e, function() {
            server.start(options.port + index);

            var wfs = Client(
                'http://127.0.0.1:' + (options.port + index)
            );

            wfs.stat('/testFolder/testFile.txt', function(e, stat) {
                isValid(!e && stat.name === 'testFile.txt' && stat.size === content.length && stat.isFile(), 'File error');
            })

            wfs.stat('/testFolder', function(e, stat) {
                isValid(!e && stat.isDirectory(), 'Folder error');
            })

            wfs.stat('/notFoundFile.txt', function(e, stat) {
                isValid(!!e);
            })
        })});
    })});
})}