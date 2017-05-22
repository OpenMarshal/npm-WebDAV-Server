"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = function(test, options, index) { test('list root folder', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(1, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.rootResource.addChild(new webdav.VirtualFile('file.txt'), function(e) { _(e, function() {
        server.start(options.port + index);

        var wfs = Client(
            'http://127.0.0.1:' + (options.port + index)
        );

        wfs.readdir('/', function(e, files) {
            if(e)
                isValid(false, e);
            else
                isValid(files.length === 1 && files[0] === 'file.txt');
        })
    })});
})}