var webdav = require('../../lib/index.js'),
    request = require('request'),
    xmljs = require('xml-js'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('PROPPATCH method', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(4 * 2, server);

    testGroup('xml', false);
    testGroup('json', true);

    function testGroup(prefix, isJSON)
    {
        server.rootResource.addChild(new webdav.VirtualFile(prefix + 'testFile.txt'), test(prefix + 'testFile.txt', isJSON));
        server.rootResource.addChild(new webdav.VirtualFolder(prefix + 'testFolder'), test(prefix + 'testFolder', isJSON));

        const pFileName = prefix + 'testPFile.txt';
        const pFilePath = path.join(__dirname, 'proppatch', pFileName);
        if(!fs.existsSync(pFilePath))
            fs.writeFileSync(pFilePath, 'Content!');
        server.rootResource.addChild(new webdav.PhysicalFile(pFilePath), test(pFileName, isJSON));

        const pFolderName = prefix + 'testPFile.txt';
        const pFolderPath = path.join(__dirname, 'proppatch', pFolderName);
        if(!fs.existsSync(pFolderPath))
            fs.writeFileSync(pFolderPath, 'Content!');
        server.rootResource.addChild(new webdav.PhysicalFolder(pFolderPath), test(pFolderName, isJSON));
    }

    function test(name, isJSON)
    {
        return (e) => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            const url = 'http://localhost:' + (options.port + index) + '/' + name;
            
            function tryCatch(callback)
            {
                try
                {
                    callback();
                }
                catch(e)
                {
                    isValid(false, 'Bad response body for ' + (isJSON ? 'JSON' : 'XML') + ' reponse.');
                }
            }

            // Add authors
            request({
                url: url,
                method: 'PROPPATCH',
                body: '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:set><D:prop><Z:Authors><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors></D:prop></D:set></D:propertyupdate>',
                headers: {
                    Accept: isJSON ? 'application/json' : undefined
                }
            }, (e, res, body) => {
                if(e)
                {
                    isValid(false, e);
                    return;
                }

                tryCatch(() => {
                    const xml = isJSON ? JSON.parse(body) : xmljs.xml2js(body, { compact: true, alwaysArray: true });
                    const response = xml['D:multistatus'][0]['D:response'][0];
                
                    if(!(response['D:propstat'][0]['D:prop'][0]['x:Authors'].length === 1 &&
                        response['D:propstat'][0]['D:status'][0]._text[0].indexOf('HTTP/1.1 20') === 0 &&
                        response['D:href'][0]._text[0] === url))
                    {
                        isValid(false, 'Error occured in the response.');
                        return;
                    }
                    
                    request({
                        url: url,
                        method: 'PROPFIND',
                        headers: {
                            Accept: isJSON ? 'application/json' : undefined
                        }
                    }, (e, res, body) => {
                        if(e)
                        {
                            isValid(false, e);
                            return;
                        }
                        
                        tryCatch(() => {
                            const xml = isJSON ? JSON.parse(body) : xmljs.xml2js(body, { compact: true, alwaysArray: true });
                            const prop = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0];

                            if(prop['x:Authors'].length !== 1)
                            {
                                isValid(false);
                                return;
                            }
                            
                            // Remove authors
                            request({
                                url: url,
                                method: 'PROPPATCH',
                                body: '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:remove><D:prop><Z:Authors/></D:prop></D:remove></D:propertyupdate>',
                                headers: {
                                    Accept: isJSON ? 'application/json' : undefined
                                }
                            }, (e, res, body) => {
                                if(e)
                                {
                                    isValid(false, e);
                                    return;
                                }

                                request({
                                    url: url,
                                    method: 'PROPFIND',
                                    headers: {
                                        Accept: isJSON ? 'application/json' : undefined
                                    }
                                }, (e, res, body) => {
                                    if(e)
                                    {
                                        isValid(false, e);
                                        return;
                                    }

                                    tryCatch(() => {
                                        const xml = isJSON ? JSON.parse(body) : xmljs.xml2js(body, { compact: true, alwaysArray: true });
                                        const prop = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0];

                                        isValid(prop['x:Authors'] === undefined);
                                    });
                                });
                            });
                        });
                    });
                });
            })
        };
    }
})