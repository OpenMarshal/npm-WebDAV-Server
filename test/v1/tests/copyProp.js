"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    xmljs = require('xml-js');

module.exports = (test, options, index) => test('copy a virtual resource with properties', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const url = 'http://localhost:' + (options.port + index);

    function copy(source, dest, callback)
    {
        request({
            url: url + source,
            method: 'COPY',
            headers: {
                Destination: url + dest
            }
        }, (e, res, body) => _(e, () => {
            callback(res.statusCode < 300);
        }))
    }

    function propfind(path, callback)
    {
        request({
            url: url + path,
            method: 'PROPFIND',
        }, (e, res, body) => _(e, () => {
            try
            {
                callback(xmljs.xml2js(body, { compact: true, alwaysArray: true }));
            }
            catch(e)
            {
                isValid(false, e);
            }
        }))
    }

    server.rootResource.addChild(new webdav.VirtualFile('file.txt'), e => _(e, () => {
        request({
            url: url + '/file.txt',
            method: 'PROPPATCH',
            body: '<?xml version="1.0" encoding="utf-8" ?> \
                    <D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"> \
                        <D:set> \
                            <D:prop> \
                                <Z:Authors> \
                                    <Z:Author>Jim Whitehead</Z:Author> \
                                    <Z:Author>Roy Fielding</Z:Author> \
                                </Z:Authors> \
                            </D:prop> \
                        </D:set> \
                    </D:propertyupdate>'
        }, (e, res, body) => _(e, () => {

            function getXMLInfo(xml)
            {
                xml = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0];

                delete xml['D:getlastmodified'];
                delete xml['D:creationdate'];
                delete xml['D:displayname'];
                delete xml['D:getetag'];

                return JSON.stringify(xml);
            }

            propfind('/file.txt', xml => {
                const xmlFile1 = getXMLInfo(xml);

                copy('/file.txt', '/file2.txt', (moved) => {
                    if(!moved)
                    {
                        isValid(false);
                        return;
                    }

                    propfind('/file.txt', xml => {
                        const xmlFile2 = getXMLInfo(xml);

                        if(xmlFile1 !== xmlFile2)
                        {
                            isValid(false, 'When copied, the original resource must not be altered');
                            return;
                        }

                        propfind('/file2.txt', xml => {
                            const xmlFile3 = getXMLInfo(xml);
                            if(xmlFile2 !== xmlFile3)
                            {
                                isValid(false, 'Properties not properly copied');
                                return;
                            }
                            
                            request({
                                url: url + '/file.txt',
                                method: 'PROPPATCH',
                                body: '<?xml version="1.0" encoding="utf-8" ?> \
                                        <D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"> \
                                            <D:set> \
                                                <D:prop> \
                                                    <Z:Authors> \
                                                        <Z:Author>Jim Whitehead2</Z:Author> \
                                                        <Z:Author>Roy Fielding2</Z:Author> \
                                                    </Z:Authors> \
                                                </D:prop> \
                                            </D:set> \
                                        </D:propertyupdate>'
                            }, (e, res, body) => _(e, () => {

                                propfind('/file.txt', xml => {
                                    const xmlFile1 = getXMLInfo(xml);

                                    propfind('/file2.txt', xml => {
                                        const xmlFile2 = getXMLInfo(xml);
                                        isValid(xmlFile1 !== xmlFile2, 'Properties must not be copied by reference but by value');
                                    })
                                })
                            }))
                        })
                    })
                })
            })
        }))
    }));
})