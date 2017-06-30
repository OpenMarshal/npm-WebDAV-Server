"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('delete a physical file', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
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
    const filePath = path.join(__dirname, 'deletePhysicalFile', fileName);
    if(!fs.existsSync(filePath))
        fs.writeFileSync(filePath, 'Test!');

    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => _(e, () => {
        wfs.stat('/' + fileName, (e, stat) => _(e, () => {
            wfs.unlink('/' + fileName, (e) => _(e, () => {
                fs.exists(filePath, (exists) => {
                    isValid(!exists)
                })
            }))
        }))
    }));
})