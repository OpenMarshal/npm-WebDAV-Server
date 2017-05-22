"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs');

module.exports = function(test, options, index) { test('copy a physical folder', function(isValid)
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

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const subFileName = 'testFile.txt';
    const subFolderName = 'subFolder';
    const folderName = 'test';
    const fileNameDest = 'test2';

    const folderPath = path.join(__dirname, 'copyPhysicalFolder', folderName);
    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);

    const subFolderPath = path.join(folderPath, subFolderName);
    if(!fs.existsSync(subFolderPath))
        fs.mkdirSync(subFolderPath);

    const subFilePath = path.join(folderPath, subFileName);
    if(!fs.existsSync(subFilePath))
        fs.writeFileSync(subFilePath, 'Content!');

    const folder = new webdav.PhysicalFolder(folderPath);
    server.rootResource.addChild(folder,function(e) { _(e, function() {
        folder.addChild(new webdav.PhysicalFile(subFilePath),function(e) { _(e, function() {
            folder.addChild(new webdav.PhysicalFolder(subFolderPath),function(e) { _(e, function() {
                request({
                    url: url + '/' + folderName,
                    method: 'COPY',
                    headers: {
                        destination: url + '/' + fileNameDest
                    }
                }, function(e, res, body) { _(e, function() {
                    wfs.stat('/' + folderName, function(e, stat) { _(e, function() {
                        wfs.stat('/' + folderName + '/' + subFileName, function(e, stat) { _(e, function() {
                            wfs.stat('/' + folderName + '/' + subFolderName, function(e, stat) { _(e, function() {
                                request({
                                    url: url + '/' + folderName,
                                    method: 'COPY',
                                    headers: {
                                        destination: url + '/' + fileNameDest
                                    }
                                }, function(e, res, body) { _(e, function() {
                                    if(res.statusCode >= 300)
                                    {
                                        isValid(false, 'Override must be a default behavior (RFC spec)');
                                        return;
                                    }

                                    request({
                                        url: url + '/' + folderName,
                                        method: 'COPY',
                                        headers: {
                                            destination: url + '/' + fileNameDest,
                                            Overwrite: 'F'
                                        }
                                    }, function(e, res, body) { _(e, function() {
                                        isValid(res.statusCode >= 300, 'Overrided but must not');
                                    })});
                                })});
                            })})
                        })})
                    })})
                })});
            })});
        })});
    })});

    function rmDir(dirPath)
    {
        fs.readdirSync(dirPath).forEach(function(name) {
            const childPath = path.join(dirPath, name);
            if(fs.statSync(childPath).isFile())
                fs.unlinkSync(childPath);
            else
                rmDir(childPath);
        })

        fs.rmdirSync(dirPath);
    }

    const destFolderName = 'folderDest';
    const destFolderPath = path.join(__dirname, 'copyPhysicalFolder', destFolderName);
    if(fs.existsSync(destFolderPath))
        rmDir(destFolderPath);
    fs.mkdirSync(destFolderPath);
    
    server.rootResource.addChild(new webdav.PhysicalFolder(destFolderPath),function(e) { _(e, function() {
        request({
            url: url + '/' + folderName,
            method: 'COPY',
            headers: {
                destination: url + '/' + destFolderName + '/' + fileNameDest
            }
        }, function(e, res, body) { _(e, function() {
            wfs.stat('/' + destFolderName + '/' + fileNameDest, function(e, stat) { _(e, function() {
                wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFileName, function(e, stat) { _(e, function() {
                    wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFolderName, function(e, stat) { _(e, function() {
                        fs.exists(path.join(destFolderPath, fileNameDest), function(exists) {
                            if(!exists)
                            {
                                isValid(false, 'The folder must be physicaly copied when possible')
                                return;
                            }

                            fs.exists(path.join(destFolderPath, fileNameDest, subFileName), function(exists) {
                                if(!exists)
                                {
                                    isValid(false, 'The file must be physicaly copied when possible')
                                    return;
                                }

                                fs.exists(path.join(destFolderPath, fileNameDest, subFolderName), function(exists) {
                                    if(!exists)
                                    {
                                        isValid(false, 'The folder must be physicaly copied when possible')
                                        return;
                                    }
                        
                                    request({
                                        url: url + '/' + folderName,
                                        method: 'COPY',
                                        headers: {
                                            destination: url + '/' + destFolderName + '/' + fileNameDest
                                        }
                                    }, function(e, res, body) { _(e, function() {
                                        if(res.statusCode >= 300)
                                        {
                                            isValid(false, 'Override must be a default behavior (RFC spec)');
                                            return;
                                        }

                                        request({
                                            url: url + '/' + folderName,
                                            method: 'COPY',
                                            headers: {
                                                destination: url + '/' + destFolderName + '/' + fileNameDest,
                                                Overwrite: 'F'
                                            }
                                        }, function(e, res, body) { _(e, function() {
                                            isValid(res.statusCode >= 300, 'Overrided but must not');
                                        })});
                                    })});
                                })
                            })
                        })
                    })})
                })})
            })})
        })});
    })});
})}