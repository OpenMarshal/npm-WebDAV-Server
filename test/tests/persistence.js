"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = function(test, options, index) { test('persistence', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(1, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    const f1 = new webdav.VirtualFile('file1.txt');
    const f1Content = 'ok, This content is the test';
    f1.content = f1Content;
    server.rootResource.addChild(f1, function(e) { _(e, function() {
        server.rootResource.addChild(new webdav.VirtualFile('file2.txt'), function(e) { _(e, function() {
            const folder1 = new webdav.VirtualFolder('folder1');
            server.rootResource.addChild(folder1, function(e) { _(e, function() {
                folder1.addChild(new webdav.VirtualFile('sfile1.txt'), function(e) { _(e, function() {
                    folder1.addChild(new webdav.VirtualFile('sfile2.txt'), function(e) { _(e, function() {
                        server.save(function(e, o) { _(e, function() {
                            const json = JSON.stringify(o, null, 4);
                            const els = JSON.parse(json);

                            var server2 = new webdav.WebDAVServer();
                            server2.start(options.port + index);
                            server2.load(els, [
                                new webdav.PhysicalFSManager(),
                                new webdav.VirtualFSManager(),
                                new webdav.RootFSManager()
                            ], function(e) { _(e, function() {
                                
                                var wfs = Client(
                                    'http://127.0.0.1:' + (options.port + index)
                                );

                                wfs.stat('/file1.txt', function(e) { _(e, function() {
                                wfs.stat('/file2.txt', function(e) { _(e, function() {
                                wfs.stat('/folder1', function(e) { _(e, function() {
                                wfs.stat('/folder1/sfile1.txt', function(e) { _(e, function() {
                                wfs.stat('/folder1/sfile2.txt', function(e) { _(e, function() {
                                    wfs.readFile('/file1.txt', function(e, content) { _(e, function() {
                                        isValid(content === f1Content);
                                    })})
                                })})
                                })})
                                })})
                                })})
                                })})
                            })});
                        })});
                    })});
                })});
            })});
        })});
    })});
})}