"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('copy a virtual folder', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
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
    server.rootResource.addChild(folder, e => _(e, () => {
        folder.addChild(new webdav.VirtualFile(subFileName), e => _(e, () => {
            folder.addChild(new webdav.VirtualFolder(subFolderName), e => _(e, () => {
                request({
                    url: url + '/' + folderName,
                    method: 'COPY',
                    headers: {
                        destination: url + '/' + fileNameDest
                    }
                }, (e, res, body) => _(e, () => {
                    wfs.stat('/' + folderName, (e, stat) => _(e, () => {
                        wfs.stat('/' + folderName + '/' + subFileName, (e, stat) => _(e, () => {
                            wfs.stat('/' + folderName + '/' + subFolderName, (e, stat) => _(e, () => {
                                request({
                                    url: url + '/' + folderName,
                                    method: 'COPY',
                                    headers: {
                                        destination: url + '/' + fileNameDest
                                    }
                                }, (e, res, body) => _(e, () => {
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
                                    }, (e, res, body) => _(e, () => {
                                        isValid(res.statusCode >= 300, 'Overrided but must not');
                                    }));
                                }));
                            }))
                        }))
                    }))
                }));
            }));
        }));
    }));
})