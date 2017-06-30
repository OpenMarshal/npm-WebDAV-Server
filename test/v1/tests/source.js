"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    stream = require('stream');

module.exports = (test, options, index) => test('source', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    function expect(value, callback)
    {
        return (e, res, body) => _(e, () => {
            if(value !== body)
                isValid(false, 'The response body (' + body + ') is not equals to the expected value (' + value + ')');
            else
                callback();
        });
    }

    const url = 'http://localhost:' + (options.port + index)

    test('source', 'T', 'F');
    test('translate', 'F', 'T');

    function test(headerName, unprocessedHeaderValue, processedHeaderValue)
    {
        let processed = '<html><body>processed content</body></html>';
        let unprocessed = 'unprocessed content';
        
        server.rootResource.addChild({
            write(targetSource, callback)
            {
                callback(null, new stream.Writable({
                    write: (chunk, encoding, callback) => {
                        if(targetSource)
                            unprocessed = chunk;
                        else
                            processed = chunk;
                        
                        callback(null);
                    }
                }));
            },
            read(targetSource, callback)
            {
                callback(null, new stream.Readable({
                    read: function(size)
                    {
                        this.push(targetSource ? unprocessed : processed);
                        this.push(null);
                    }
                }));
            },
            webName(callback)
            {
                callback(null, 'testFile.txt');
            },
            mimeType(targetSource, callback)
            {
                callback(null, targetSource ? 'text/plain' : 'text/html');
            },
            size(targetSource, callback)
            {
                callback(null, targetSource ? unprocessed.length : processed.length);
            },
            getLocks(callback)
            {
                callback(null, []);
            },
            type(callback)
            {
                callback(null, webdav.ResourceType.File);
            }
        }, (e) => _(e, () => {
            request({
                url: url + '/testFile.txt',
                method: 'GET',
                headers: {
                }
            }, expect(processed, () => {
                request({
                    url: url + '/testFile.txt',
                    method: 'GET',
                    headers: {
                        [headerName]: unprocessedHeaderValue
                    }
                }, expect(unprocessed, () => {
                    const old = {
                        processed,
                        unprocessed
                    }
                    request({
                        url: url + '/testFile.txt',
                        method: 'PUT',
                        headers: {
                            [headerName]: processedHeaderValue
                        },
                        body: processed + 'addon'
                    }, (e, res, body) => _(e, () => {
                        request({
                            url: url + '/testFile.txt',
                            method: 'PUT',
                            headers: {
                                [headerName]: unprocessedHeaderValue
                            },
                            body: unprocessed + 'addonX'
                        }, (e, res, body) => _(e, () => {
                            request({
                                url: url + '/testFile.txt',
                                method: 'GET',
                                headers: {
                                    [headerName]: processedHeaderValue
                                }
                            }, expect(old.processed + 'addon', () => {
                                request({
                                    url: url + '/testFile.txt',
                                    method: 'GET',
                                    headers: {
                                        [headerName]: unprocessedHeaderValue
                                    }
                                }, expect(old.unprocessed + 'addonX', () => {
                                    isValid(true);
                                }))
                            }))
                        }))
                    }))
                }))
            }))
        }))
    }
})