"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('read a physical file', (isValid, server) =>
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
    const filePath = path.join(__dirname, 'readPhysicalFile', fileName);
    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => _(e, () => {
        wfs.readFile('/' + fileName, (e, content) => {
            if(e)
                isValid(false, e)
            else
                isValid(content.toString() === fs.readFileSync(filePath).toString());
        })
    }));
    
    const folderName = 'readPhysicalFile';
    const folderPath = path.join(__dirname, folderName);
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), e => _(e, () => {
        wfs.readFile('/' + folderName, (e, content) => {
            isValid(!!e)
        })
    }));
})