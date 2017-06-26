"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('persistence', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    const server2 = new webdav.WebDAVServer();
    const f1 = new webdav.VirtualFile('file1.txt');
    const f1Content = 'ok, This content is the test';
    f1.write(true, (e, stream) => _(e, () => stream.end(f1Content, (e) => _(e, () => {
        server2.rootResource.addChild(f1, e => _(e, () => {
            server2.rootResource.addChild(new webdav.VirtualFile('file2.txt'), e => _(e, () => {
                const folder1 = new webdav.VirtualFolder('folder1');
                server2.rootResource.addChild(folder1, e => _(e, () => {
                    folder1.addChild(new webdav.VirtualFile('sfile1.txt'), e => _(e, () => {
                        folder1.addChild(new webdav.VirtualFile('sfile2.txt'), e => _(e, () => {
                            server2.save((e, o) => _(e, () => {
                                const json = JSON.stringify(o, null, 4);
                                const els = JSON.parse(json);

                                server.load(els, [
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
    }))))
})