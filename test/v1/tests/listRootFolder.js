"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('list root folder', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.rootResource.addChild(new webdav.VirtualFile('file.txt'), e => _(e, () => {

        var wfs = Client(
            'http://127.0.0.1:' + (options.port + index)
        );

        wfs.readdir('/', (e, files) => {
            if(e)
                isValid(false, e);
            else
                isValid(files.length === 1 && files[0] === 'file.txt');
        })
    }));
})