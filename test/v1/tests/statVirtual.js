"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('stat of virtual resources', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const content = 'Content!!!';

    const folder = new webdav.VirtualFolder('testFolder');
    server.rootResource.addChild(folder, e => _(e, () => {
        const file = new webdav.VirtualFile('testFile.txt');
        file.write(true, (e, stream) => _(e, () => stream.end(content, (e) => _(e, () => {
            folder.addChild(file, e => _(e, () => {

                var wfs = Client(
                    'http://127.0.0.1:' + (options.port + index)
                );

                wfs.stat('/testFolder/testFile.txt', (e, stat) => {
                    isValid(!e && stat.name === 'testFile.txt' && stat.size === content.length && stat.isFile(), 'File error');
                })

                wfs.stat('/testFolder', (e, stat) => {
                    isValid(!e && stat.isDirectory(), 'Folder error');
                })

                wfs.stat('/notFoundFile.txt', (e, stat) => {
                    isValid(!!e);
                })
            }));
        }))))
    }));
})