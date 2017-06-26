"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('stat of physical resources', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const content = 'Content!!!';

    const folderName = 'testFolder';
    const folderPath = path.join(__dirname, 'statPhysical', folderName);
    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);

    const folder = new webdav.PhysicalFolder(folderPath);
    server.rootResource.addChild(folder, e => _(e, () => {
        const fileName = 'testFile.txt';
        const filePath = path.join(folderPath, fileName);

        if(!fs.existsSync(filePath))
            fs.writeFileSync(filePath, content);

        folder.addChild(new webdav.PhysicalFile(filePath), e => _(e, () => {

            var wfs = Client(
                'http://127.0.0.1:' + (options.port + index)
            );

            wfs.stat('/' + folderName + '/' + fileName, (e, stat) => {
                isValid(!e && stat.name === fileName && stat.size === content.length && stat.isFile(), 'File error');
            })

            wfs.stat('/' + folderName, (e, stat) => {
                isValid(!e && stat.isDirectory(), 'Folder error');
            })
        }));
    }));
})