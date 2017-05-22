"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('persistence', isValid =>
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    const f1 = new webdav.VirtualFile('file1.txt');
    const f1Content = 'ok, This content is the test';
    f1.content = f1Content;
    server.rootResource.addChild(f1, e => _(e, () => {
        server.rootResource.addChild(new webdav.VirtualFile('file2.txt'), e => _(e, () => {
            const folder1 = new webdav.VirtualFolder('folder1');
            server.rootResource.addChild(folder1, e => _(e, () => {
                folder1.addChild(new webdav.VirtualFile('sfile1.txt'), e => _(e, () => {
                    folder1.addChild(new webdav.VirtualFile('sfile2.txt'), e => _(e, () => {
                        server.save((e, o) => _(e, () => {
                            const json = JSON.stringify(o, null, 4);
                            const els = JSON.parse(json);

                            var server2 = new webdav.WebDAVServer();
                            server2.start(options.port + index);
                            server2.load(els, [
                                new webdav.PhysicalFSManager(),
                                new webdav.VirtualFSManager(),
                                new webdav.RootFSManager()
                            ], (e) => _(e, () => {
                                
                                var wfs = Client(
                                    'http://127.0.0.1:' + (options.port + index)
                                );

                                wfs.stat('/file1.txt', (e) => _(e, () => {
                                wfs.stat('/file2.txt', (e) => _(e, () => {
                                wfs.stat('/folder1', (e) => _(e, () => {
                                wfs.stat('/folder1/sfile1.txt', (e) => _(e, () => {
                                wfs.stat('/folder1/sfile2.txt', (e) => _(e, () => {
                                    wfs.readFile('/file1.txt', (e, content) => _(e, () => {
                                        isValid(content === f1Content);
                                    }))
                                }))
                                }))
                                }))
                                }))
                                }))
                            }));
                        }));
                    }));
                }));
            }));
        }));
    }));
})