"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('make a folder', (isValid, server) =>
{
    isValid = isValid.multiple(4, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), e => _(e, () => {

        var wfs = Client(
            'http://127.0.0.1:' + (options.port + index)
        );
        
        wfs.mkdir('/testFile.txt/testFail', (e) => {
            isValid(!!e)
        })

        wfs.mkdir('/undefined/testFail', (e) => {
            isValid(!!e)
        })

        wfs.mkdir('/testSuccess', (e) => _(e, () => {
            wfs.mkdir('/testSuccess/testSuccess2', (e) => {
                if(e)
                    isValid(false, e)
                else
                    isValid(true);
            })
        }))
        
        const folderName = 'makeFolder';
        const folderPath = path.join(__dirname, folderName);

        const subFolderName = 'folder';
        const subFolderPath = path.join(folderPath, subFolderName);
        if(fs.existsSync(subFolderPath))
            fs.rmdirSync(subFolderPath);
        
        server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), e => _(e, () => {
            wfs.mkdir('/' + folderName + '/' + subFolderName, (e) => {
                if(e)
                    isValid(false, e)
                else
                    isValid(fs.existsSync(subFolderPath));
            })
        }));
    }));
})