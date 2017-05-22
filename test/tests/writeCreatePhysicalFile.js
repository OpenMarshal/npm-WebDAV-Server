"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('write/create a physical file', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const folderName = 'writeCreatePhysicalFile';
    const folderPath = path.join(__dirname, folderName);

    const fileName = 'file';
    const filePath = path.join(folderPath, fileName);
    if(fs.existsSync(filePath))
        fs.unlink(filePath);
    
    const fileContent = 'Hello!';
    
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), function(e) { _(e, function() {
        wfs.writeFile('/' + folderName + '/' + fileName, fileContent, function(e) {
            if(e)
                isValid(false, e)
            else
                isValid(fs.existsSync(filePath) && fs.readFileSync(filePath).toString() === fileContent.toString());
        })
    })});
})}