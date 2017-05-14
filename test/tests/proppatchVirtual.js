var webdav = require('../../lib/index.js'),
    request = require('request'),
    xmljs = require('xml-js')

module.exports = (test, options, index) => test('proppatch a virtual resource', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        const url = 'http://localhost:' + (options.port + index) + '/testFile.txt';

        // Add authors
        request({
            url: url,
            method: 'PROPPATCH',
            body: '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:set><D:prop><Z:Authors><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors></D:prop></D:set></D:propertyupdate>'
        }, (e, res, body) => {
            if(e)
            {
                isValid(false, e);
                return;
            }

            const xml = xmljs.xml2js(body, { compact: true, alwaysArray: true });
            const response = xml['D:multistatus'][0]['D:response'][0];
            
            try
            {
                if(!(response['D:propstat'][0]['D:prop'][0]['x:Authors'].length === 1 &&
                    response['D:propstat'][0]['D:status'][0]._text[0].indexOf('HTTP/1.1 20') === 0 &&
                    response['D:href'][0]._text[0] === url))
                {
                    isValid(false, 'Error occured in the response.');
                    return;
                }
                
                request({
                    url: url,
                    method: 'PROPFIND'
                }, (e, res, body) => {
                    if(e)
                    {
                        isValid(false, e);
                        return;
                    }
                    
                    const xml = xmljs.xml2js(body, { compact: true, alwaysArray: true });
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
                        body: '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:remove><D:prop><Z:Authors/></D:prop></D:remove></D:propertyupdate>'
                    }, (e, res, body) => {
                        if(e)
                        {
                            isValid(false, e);
                            return;
                        }

                        request({
                            url: url,
                            method: 'PROPFIND'
                        }, (e, res, body) => {
                            if(e)
                            {
                                isValid(false, e);
                                return;
                            }
                            const xml = xmljs.xml2js(body, { compact: true, alwaysArray: true });
                            const prop = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0];

                            isValid(prop['x:Authors'] === undefined);
                        });
                    });
                });
            }
            catch(e)
            {
                isValid(false, 'Bad response body.');
            }
        })
    })
})