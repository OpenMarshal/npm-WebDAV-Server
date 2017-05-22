"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = function(test, options, index) { test('make a folder', function(isValid)
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(4, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), function(e) { _(e, function() {
        server.start(options.port + index);

        var wfs = Client(
            'http://127.0.0.1:' + (options.port + index)
        );
        
        wfs.mkdir('/testFile.txt/testFail', function(e) {
            isValid(!!e)
        })

        wfs.mkdir('/undefined/testFail', function(e) {
            isValid(!!e)
        })

        wfs.mkdir('/testSuccess', function(e) { _(e, function() {
            wfs.mkdir('/testSuccess/testSuccess2', function(e) {
                if(e)
                    isValid(false, e)
                else
                    isValid(true);
            })
        })})
        
        const folderName = 'makeFolder';
        const folderPath = path.join(__dirname, folderName);

        const subFolderName = 'folder';
        const subFolderPath = path.join(folderPath, subFolderName);
        if(fs.existsSync(subFolderPath))
            fs.rmdirSync(subFolderPath);
        
        server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), function(e) { _(e, function() {
            wfs.mkdir('/' + folderName + '/' + subFolderName, function(e) {
                if(e)
                    isValid(false, e)
                else
                    isValid(fs.existsSync(subFolderPath));
            })
        })});
    })});
})}