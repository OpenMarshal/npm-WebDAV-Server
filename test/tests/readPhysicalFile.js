"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('read a physical file', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);
    server.start(options.port + index);
    const _ = function(e, cb) {
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
    server.rootResource.addChild(new webdav.PhysicalFile(filePath), function(e) { _(e, function() {
        wfs.readFile('/' + fileName, function(e, content) {
            if(e)
                isValid(false, e)
            else
                isValid(content.toString() === fs.readFileSync(filePath).toString());
        })
    })});
    
    const folderName = 'readPhysicalFile';
    const folderPath = path.join(__dirname, folderName);
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), function(e) { _(e, function() {
        wfs.readFile('/' + folderName, function(e, content) {
            isValid(!!e)
        })
    })});
})}