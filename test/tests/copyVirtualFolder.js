"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = function(test, options, index) { test('copy a virtual folder', function(isValid)
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

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const subFileName = 'testFile.txt';
    const subFolderName = 'subFolder';
    const folderName = 'test';
    const fileNameDest = 'test2';
    const folder = new webdav.VirtualFolder(folderName);
    server.rootResource.addChild(folder, function(e) { _(e, function() {
        folder.addChild(new webdav.VirtualFile(subFileName), function(e) { _(e, function() {
            folder.addChild(new webdav.VirtualFolder(subFolderName), function(e) { _(e, function() {
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
})}