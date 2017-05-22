"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('delete a physical folder', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const folderName = 'emptyFolder';
    const folderPath = path.join(__dirname, 'deletePhysicalFolder', folderName);
    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);

    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), function(e) { _(e, function() {
        wfs.stat('/' + folderName, function(e, stat) { _(e, function() {
            wfs.unlink('/' + folderName, function(e) { _(e, function() {
                fs.exists(folderPath, function(exists) {
                    isValid(!exists)
                })
            })})
        })})
    })});

    const folderName2 = 'notEmptyFolder';
    const folderPath2 = path.join(__dirname, 'deletePhysicalFolder', folderName2);
    if(!fs.existsSync(folderPath2))
        fs.mkdirSync(folderPath2);
    const fd = new webdav.PhysicalFolder(folderPath2);
    
    const folderName3 = 'folder';
    const folderPath3 = path.join(folderPath2, folderName3);
    if(!fs.existsSync(folderPath3))
        fs.mkdirSync(folderPath3);
    fd.addChild(new webdav.PhysicalFolder(folderPath3), function(e) { _(e, function() {
        const fileName4 = 'file.txt';
        const filePath4 = path.join(folderPath2, fileName4);
        if(!fs.existsSync(filePath4))
            fs.writeFileSync(filePath4, 'Test!');
        fd.addChild(new webdav.PhysicalFile(filePath4), function(e) { _(e, function() {
            server.rootResource.addChild(fd, function(e) { _(e, function() {
                wfs.stat('/' + folderName2, function(e, stat) { _(e, function() {
                    wfs.unlink('/' + folderName2, function(e) { _(e, function() {
                        fs.exists(folderPath2, function(exists) {
                            isValid(!exists)
                        })
                    })})
                })})
            })});
        })});
    })});
})}