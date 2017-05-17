var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('copy a virtual folder', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const subFileName = 'testFile.txt';
    const subFolderName = 'subFolder';
    const folderName = 'test';
    const fileNameDest = 'test2';
    const folder = new webdav.VirtualFolder(folderName);
    server.rootResource.addChild(folder, e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        folder.addChild(new webdav.VirtualFile(subFileName), e => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            folder.addChild(new webdav.VirtualFolder(subFolderName), e => {
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
})