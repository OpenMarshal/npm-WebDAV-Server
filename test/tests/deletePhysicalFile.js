"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('delete a physical file', function(isValid)
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

    const fileName = 'file.txt';
    const filePath = path.join(__dirname, 'deletePhysicalFile', fileName);
    if(!fs.existsSync(filePath))
        fs.writeFileSync(filePath, 'Test!');

    server.rootResource.addChild(new webdav.PhysicalFile(filePath), function(e) { _(e, function() {
        wfs.stat('/' + fileName, function(e, stat) { _(e, function() {
            wfs.unlink('/' + fileName, function(e) { _(e, function() {
                fs.exists(filePath, function(exists) {
                    isValid(!exists)
                })
            })})
        })})
    })});
})}