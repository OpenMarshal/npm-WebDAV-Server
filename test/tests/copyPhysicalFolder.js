var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs');

module.exports = (test, options, index) => test('copy a virtual folder', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);

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
    server.rootResource.addChild(folder, e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        folder.addChild(new webdav.PhysicalFile(subFilePath), e => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            folder.addChild(new webdav.PhysicalFolder(subFolderPath), e => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                request({
                    url: url + '/' + folderName,
                    method: 'COPY',
                    headers: {
                        destination: url + '/' + fileNameDest
                    }
                }, (e, res, body) => {
                    if(e)
                    {
                        isValid(false, e)
                        return;
                    }

                    wfs.stat('/' + folderName, (e, stat) => {
                        if(e)
                        {
                            isValid(false, e)
                            return;
                        }

                        wfs.stat('/' + folderName + '/' + subFileName, (e, stat) => {
                            if(e)
                            {
                                isValid(false, e)
                                return;
                            }

                            wfs.stat('/' + folderName + '/' + subFolderName, (e, stat) => {
                                if(e)
                                {
                                    isValid(false, e)
                                    return;
                                }

                                request({
                                    url: url + '/' + folderName,
                                    method: 'COPY',
                                    headers: {
                                        destination: url + '/' + fileNameDest
                                    }
                                }, (e, res, body) => {
                                    if(e)
                                    {
                                        isValid(false, e)
                                        return;
                                    }
                                    
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
                                    }, (e, res, body) => {
                                        if(e)
                                        {
                                            isValid(false, e)
                                            return;
                                        }
                                        
                                        isValid(res.statusCode >= 300, 'Overrided but must not');
                                    });
                                });
                            })
                        })
                    })
                });
            });
        });
    });

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
    
    server.rootResource.addChild(new webdav.PhysicalFolder(destFolderPath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        request({
            url: url + '/' + folderName,
            method: 'COPY',
            headers: {
                destination: url + '/' + destFolderName + '/' + fileNameDest
            }
        }, (e, res, body) => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            wfs.stat('/' + destFolderName + '/' + fileNameDest, (e, stat) => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFileName, (e, stat) => {
                    if(e)
                    {
                        isValid(false, e)
                        return;
                    }

                    wfs.stat('/' + destFolderName + '/' + fileNameDest + '/' + subFolderName, (e, stat) => {
                        if(e)
                        {
                            isValid(false, e)
                            return;
                        }

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
                                    }, (e, res, body) => {
                                        if(e)
                                        {
                                            isValid(false, e)
                                            return;
                                        }
                                        
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
                                        }, (e, res, body) => {
                                            if(e)
                                            {
                                                isValid(false, e)
                                                return;
                                            }
                                            
                                            isValid(res.statusCode >= 300, 'Overrided but must not');
                                        });
                                    });
                                })
                            })
                        })
                    })
                })
            })
        });
    });
})