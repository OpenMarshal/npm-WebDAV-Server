var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs'),
    path = require('path'),
    fs = require('fs');

module.exports = (test, options, index) => test('copy a physical file', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const fileName = 'test.txt';
    const filePath = path.join(__dirname, 'copyPhysicalFile', fileName);
    if(!fs.existsSync(filePath))
        fs.writeFileSync(filePath, 'Content!');

    const fileNameDest = 'test2.txt';
    server.rootResource.addChild(new webdav.PhysicalFile(filePath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        request({
            url: url + '/' + fileName,
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

            wfs.stat('/' + fileName, (e, stat) => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                wfs.stat('/' + fileNameDest, (e, stat) => {
                    if(e)
                    {
                        isValid(false, e)
                        return;
                    }
                    
                    request({
                        url: url + '/' + fileName,
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
                            url: url + '/' + fileName,
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
        });
    });

    const folderName = 'folder';
    const folderPath = path.join(__dirname, 'copyPhysicalFile', folderName);
    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);
    
    const fileDestPath = path.join(folderPath, fileName);
    if(fs.existsSync(fileDestPath))
        fs.unlinkSync(fileDestPath);
    
    server.rootResource.addChild(new webdav.PhysicalFolder(folderPath), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        request({
            url: url + '/' + fileName,
            method: 'COPY',
            headers: {
                destination: url + '/' + folderName + '/' + fileName
            }
        }, (e, res, body) => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            wfs.stat('/' + fileName, (e, stat) => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                wfs.stat('/' + folderName + '/' + fileName, (e, stat) => {
                    if(e)
                    {
                        isValid(false, e)
                        return;
                    }

                    fs.exists(fileDestPath, (exists) => {
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
                                url: url + '/' + fileName,
                                method: 'COPY',
                                headers: {
                                    destination: url + '/' + folderName + '/' + fileName,
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
})