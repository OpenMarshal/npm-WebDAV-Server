"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('delete a virtual folder', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const folderName = 'folder';
    server.rootResource.addChild(new webdav.VirtualFolder(folderName), e => _(e, () => {
        wfs.stat('/' + folderName, (e, stat) => _(e, () => {
            wfs.unlink('/' + folderName, (e) => _(e, () => {
                wfs.stat('/' + folderName, (e, stat) => {
                    isValid(!!e)
                })
            }))
        }))
    }));

    const folderName2 = 'notEmptyFolder';
    const vd = new webdav.VirtualFolder(folderName2);
    vd.addChild(new webdav.VirtualFolder('folder'), e => _(e, () => {
        vd.addChild(new webdav.VirtualFile('file.txt'), e => _(e, () => {
            server.rootResource.addChild(vd, e => _(e, () => {
                wfs.stat('/' + folderName2, (e, stat) => _(e, () => {
                    wfs.unlink('/' + folderName2, (e) => _(e, () => {
                        wfs.stat('/' + folderName2, (e, stat) => {
                            isValid(!!e)
                        })
                    }))
                }))
            }));
        }));
    }));
})