"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('stat of physical resources', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);
    const _ = function(e, cb) {
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
    server.rootResource.addChild(folder, function(e) { _(e, function() {
        const fileName = 'testFile.txt';
        const filePath = path.join(folderPath, fileName);

        if(!fs.existsSync(filePath))
            fs.writeFileSync(filePath, content);

        folder.addChild(new webdav.PhysicalFile(filePath), function(e) { _(e, function() {
            server.start(options.port + index);

            var wfs = Client(
                'http://127.0.0.1:' + (options.port + index)
            );

            wfs.stat('/' + folderName + '/' + fileName, function(e, stat) {
                isValid(!e && stat.name === fileName && stat.size === content.length && stat.isFile(), 'File error');
            })

            wfs.stat('/' + folderName, function(e, stat) {
                isValid(!e && stat.isDirectory(), 'Folder error');
            })
        })});
    })});
})}