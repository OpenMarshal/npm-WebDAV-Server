"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('move a physical resource', (isValid, server) =>
{
    isValid = isValid.multiple(4, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const rootTestPath = path.join(__dirname, 'movePhysical');

    test('file', true, s => new webdav.PhysicalFile(s));
    test('folder', false, s => new webdav.PhysicalFolder(s));
    testVirtual('file', true, s => new webdav.PhysicalFile(s));
    testVirtual('folder', false, s => new webdav.PhysicalFolder(s));

    function move(source, dest, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + source,
            method: 'MOVE',
            headers: {
                Destination: 'http://localhost:' + (options.port + index) + dest
            }
        }, (e, res, body) => _(e, () => {
            callback(res.statusCode < 300);
        }))
    }

    function exist(path, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + path,
            method: 'PROPFIND'
        }, (e, res, body) => _(e, () => {
            callback(res.statusCode < 300);
        }))
    }

    function test(prefixName, isFile, constructor)
    {
        const type = isFile ? 'file' : 'folder';

        const groupFolder = prefixName;
        const fileName = prefixName + '.txt';
        const fileNameDest = prefixName + '2.txt';
        const groupFolderPath = path.join(rootTestPath, groupFolder);
        const filePath = path.join(groupFolderPath, fileName);
        const filePathDest = path.join(groupFolderPath, fileNameDest);
        if(!fs.existsSync(groupFolderPath))
            fs.mkdirSync(groupFolderPath);
        if(fs.existsSync(filePathDest))
        {
            if(isFile)
                fs.unlinkSync(filePathDest);
            else
                fs.rmdirSync(filePathDest);
        }
        if(!fs.existsSync(filePath))
        {
            if(isFile)
                fs.writeFileSync(filePath, 'Content!');
            else
                fs.mkdirSync(filePath);
        }

        const groupResource = new webdav.PhysicalFolder(groupFolderPath);
        server.rootResource.addChild(groupResource, e => _(e, () => {
        groupResource.addChild(constructor(filePath), e => _(e, () => {
            move('/' + groupFolder + '/' + fileName, '/' + groupFolder + '/' + fileNameDest, (moved) => {
                if(!moved)
                {
                    isValid(false);
                    return;
                }

                exist('/' + groupFolder + '/' + fileName, (exists) => {
                    if(exists)
                    {
                        isValid(false, 'The ' + type + ' must not exist [p -> p]');
                        return;
                    }

                    exist('/' + groupFolder + '/' + fileNameDest, (exists) => {
                        if(!exists)
                        {
                            isValid(false, 'The ' + type + ' must exist [p -> p]');
                            return;
                        }

                        fs.exists(filePath, (exists) => {
                            if(exists)
                            {
                                isValid(false, 'The ' + type + ' has been moved virtualy only [p -> p]');
                                return;
                            }

                            fs.exists(filePathDest, (exists) => {
                                isValid(exists, 'The ' + type + ' must be present in the real destination, but it is not the case [p -> p]');
                            })
                        })
                    })
                })
            })
        }));
        }));
    }

    function testVirtual(prefixName, isFile, constructor)
    {
        const type = isFile ? 'file' : 'folder';

        const fileName = prefixName + 'v.txt';
        const fileNameDest = prefixName + '2v';
        const filePath = path.join(rootTestPath, fileName);
        
        if(!fs.existsSync(filePath))
        {
            if(isFile)
                fs.writeFileSync(filePath, 'Content!');
            else
                fs.mkdirSync(filePath);
        }

        const dest = new webdav.VirtualFolder(fileNameDest);

        server.rootResource.addChild(dest, e => _(e, () => {
            server.rootResource.addChild(constructor(filePath), e => _(e, () => {
                move('/' + fileName, '/' + fileNameDest + '/' + fileName, (moved) => {
                    if(!moved)
                    {
                        isValid(false, 'Move didn\'t work [p -> v]');
                        return;
                    }

                    exist('/' + fileName, (exists) => {
                        if(exists)
                        {
                            isValid(false, 'The ' + type + ' must not exist [p -> v]');
                            return;
                        }

                        exist('/' + fileNameDest + '/' + fileName, (exists) => {
                            if(!exists)
                            {
                                isValid(false, 'The ' + type + ' must exist [p -> v]');
                                return;
                            }

                            fs.exists(filePath, (exists) => {
                                isValid(exists, 'The ' + type + ' must not be really moved when moved to a virtual folder [p -> v]');
                            })
                        })
                    })
                })
            }));
        }));
    }
})