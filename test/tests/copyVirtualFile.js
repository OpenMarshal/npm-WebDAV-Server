var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('copy a virtual file', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const fileName = 'test.txt';
    const fileNameDest = 'test2.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), e => {
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
})