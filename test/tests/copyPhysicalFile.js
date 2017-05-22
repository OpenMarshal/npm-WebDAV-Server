"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs');

module.exports = function(test, options, index) { test('copy a physical file', function(isValid)
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

    const fileName = 'test.txt';
    const filePath = path.join(__dirname, 'copyPhysicalFile', fileName);
    if(!fs.existsSync(filePath))
        fs.writeFileSync(filePath, 'Content!');

    const fileNameDest = 'test2.txt';
    server.rootResource.addChild(new webdav.PhysicalFile(filePath), function(e) { _(e, function() {
        request({
            url: url + '/' + fileName,
            method: 'COPY',
            headers: {
                destination: url + '/' + fileNameDest
            }
        }, function(e, res, body) { _(e, function() {
            wfs.stat('/' + fileName, function(e, stat) { _(e, function() {
                wfs.stat('/' + fileNameDest, function(e, stat) { _(e, function() {
                    request({
                        url: url + '/' + fileName,
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
                            url: url + '/' + fileName,
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
        })});
    })});

    const folderName = 'folder';
    const folderPath = path.join(__dirname, 'copyPhysicalFile', folderName);
    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);
    
    const fileDestPath = path.join(folderPath, fileName);
    if(fs.existsSync(fileDestPath))
        fs.unlinkSync(fileDestPath);
    
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), function(e) { _(e, function() {
        request({
            url: url + '/' + fileName,
            method: 'COPY',
            headers: {
                destination: url + '/' + folderName + '/' + fileName
            }
        }, function(e, res, body) { _(e, function() {
            wfs.stat('/' + fileName, function(e, stat) { _(e, function() {
                wfs.stat('/' + folderName + '/' + fileName, function(e, stat) { _(e, function() {
                    fs.exists(fileDestPath, function(exists) {
                        if(!exists)
                        {
                            isValid(false, 'The file must be physicaly copied when possible');
                            return;
                        }
                    
                        request({
                            url: url + '/' + fileName,
                            method: 'COPY',
                            headers: {
                                destination: url + '/' + folderName + '/' + fileName
                            }
                        }, function(e, res, body) { _(e, function() {
                            if(res.statusCode >= 300)
                            {
                                isValid(false, 'Override must be a default behavior (RFC spec)');
                                return;
                            }

                            request({
                                url: url + '/' + fileName,
                                method: 'COPY',
                                headers: {
                                    destination: url + '/' + folderName + '/' + fileName,
                                    Overwrite: 'F'
                                }
                            }, function(e, res, body) { _(e, function() {
                                isValid(res.statusCode >= 300, 'Overrided but must not');
                            })});
                        })});
                    })
                })})
            })})
        })});
    })});
})}