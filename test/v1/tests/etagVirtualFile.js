"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    request = require('request'),
    xmljs = require('xml-js')

module.exports = (test, options, index) => test('etag of virtual file', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), e => _(e, () => {

        var wfs = Client(
            'http://127.0.0.1:' + (options.port + index)
        );

        function propfind(callback)
        {
            request({
                url: 'http://127.0.0.1:' + (options.port + index) + '/testFile.txt',
                method: 'PROPFIND'
            }, (e, res, body) => {
                if(e)
                {
                    isValid(false, e);
                    return;
                }
                if(res.statusCode > 300)
                {
                    isValid(false, 'Status code received : ' + res.statusCode);
                    return;
                }

                try
                {
                    callback(xmljs.xml2js(body, { compact: true, alwaysArray: true }));
                }
                catch(e)
                {
                    isValid(false, e);
                }
            })
        }

        propfind((doc) => {
            const etag1 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];

            propfind((doc) => {
                const etag2 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];

                if(etag1 !== etag2)
                {
                    isValid(false, 'ETag changed without file change');
                    return;
                }
                
                wfs.writeFile('/testFile.txt', 'New content', (e) => _(e, () => {
                    propfind((doc) => {
                        const etag3 = doc['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:getetag'][0]._text[0];
                        if(etag1 === etag3)
                            isValid(false, 'ETag didn\'t change with file change');
                        else
                            isValid(true);
                    })
                }))
            })
        })
    }));
})