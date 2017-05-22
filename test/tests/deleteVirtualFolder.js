"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = function(test, options, index) { test('delete a virtual folder', function(isValid)
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

    const folderName = 'folder';
    server.rootResource.addChild(new webdav.VirtualFolder(folderName), function(e) { _(e, function() {
        wfs.stat('/' + folderName, function(e, stat) { _(e, function() {
            wfs.unlink('/' + folderName, function(e) { _(e, function() {
                wfs.stat('/' + folderName, function(e, stat) {
                    isValid(!!e)
                })
            })})
        })})
    })});

    const folderName2 = 'notEmptyFolder';
    const vd = new webdav.VirtualFolder(folderName2);
    vd.addChild(new webdav.VirtualFolder('folder'), function(e) { _(e, function() {
        vd.addChild(new webdav.VirtualFile('file.txt'), function(e) { _(e, function() {
            server.rootResource.addChild(vd, function(e) { _(e, function() {
                wfs.stat('/' + folderName2, function(e, stat) { _(e, function() {
                    wfs.unlink('/' + folderName2, function(e) { _(e, function() {
                        wfs.stat('/' + folderName2, function(e, stat) {
                            isValid(!!e)
                        })
                    })})
                })})
            })});
        })});
    })});
})}