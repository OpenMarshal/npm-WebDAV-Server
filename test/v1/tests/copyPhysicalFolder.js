"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs');

module.exports = (test, options, index) => test('copy a physical folder', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
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
    server.rootResource.addChild(folder, e => _(e, () => {
        folder.addChild(new webdav.PhysicalFile(subFilePath), e => _(e, () => {
            folder.addChild(new webdav.PhysicalFolder(subFolderPath), e => _(e, () => {
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

    function rmDir(dirPath)
    {
        fs.readdirSync(dirPath).forEach(name => {
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
    
    server.rootResource.addChild(new webdav.PhysicalFolder(destFolderPath), e => _(e, () => {
        request({
            url: url + '/' + folderName,
            method: 'COPY',
            headers: {
                destination: url + '/' + destFolderName + '/' + fileNameDest
            }
        }, (e, res, body) => _(e, () => {
            wfs.stat('/' + destFolderName + '/' + fileNameDest, (e, stat) => _(e, () => {
                wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFileName, (e, stat) => _(e, () => {
                    wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFolderName, (e, stat) => _(e, () => {
                        fs.exists(path.join(destFolderPath, fileNameDest), (exists) => {
                            if(!exists)
                            {
                                isValid(false, 'The folder must be physicaly copied when possible')
                                return;
                            }

                            fs.exists(path.join(destFolderPath, fileNameDest, subFileName), (exists) => {
                                if(!exists)
                                {
                                    isValid(false, 'The file must be physicaly copied when possible')
                                    return;
                                }

                                fs.exists(path.join(destFolderPath, fileNameDest, subFolderName), (exists) => {
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
                                                destination: url + '/' + destFolderName + '/' + fileNameDest,
                                                Overwrite: 'F'
                                            }
                                        }, (e, res, body) => _(e, () => {
                                            isValid(res.statusCode >= 300, 'Overrided but must not');
                                        }));
                                    }));
                                })
                            })
                        })
                    }))
                }))
            }))
        }));
    }));
})