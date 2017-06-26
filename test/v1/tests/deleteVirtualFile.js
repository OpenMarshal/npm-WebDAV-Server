"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('delete a virtual file', (isValid, server) =>
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

    const fileName = 'file.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), e => _(e, () => {
        wfs.stat('/' + fileName, (e, stat) => _(e, () => {
            wfs.unlink('/' + fileName, (e) => _(e, () => {
                wfs.stat('/' + fileName, (e, stat) => {
                    isValid(!!e)
                })
            }))
        }))
    }));

    wfs.unlink('/fileNotFound.txt', (e) => {
        isValid(!!e)
    })
})