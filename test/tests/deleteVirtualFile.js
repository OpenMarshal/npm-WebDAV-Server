"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = function(test, options, index) { test('delete a virtual file', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const fileName = 'file.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), function(e) { _(e, function() {
        wfs.stat('/' + fileName, function(e, stat) { _(e, function() {
            wfs.unlink('/' + fileName, function(e) { _(e, function() {
                wfs.stat('/' + fileName, function(e, stat) {
                    isValid(!!e)
                })
            })})
        })})
    })});

    wfs.unlink('/fileNotFound.txt', function(e) {
        isValid(!!e)
    })
})}