"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request');

module.exports = (test, options, index) => test('source', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);
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

    let processed = '<html><body>processed content</body></html>';
    let unprocessed = 'unprocessed content';
    
    server.rootResource.addChild({
        append(data, targetSource, callback)
        {
            if(targetSource)
                unprocessed += data;
            else
                processed += data;
            callback(null);
        },
        write(data, targetSource, callback)
        {
            if(targetSource)
                unprocessed = data;
            else
                processed = data;
            callback(null);
        },
        read(targetSource, callback)
        {
            callback(null, targetSource ? unprocessed : processed);
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
                    source: 'T'
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
                    },
                    body: processed + 'addon'
                }, (e, res, body) => _(e, () => {
                    request({
                        url: url + '/testFile.txt',
                        method: 'PUT',
                        headers: {
                            source: 'T'
                        },
                        body: unprocessed + 'addonX'
                    }, (e, res, body) => _(e, () => {
                        request({
                            url: url + '/testFile.txt',
                            method: 'GET',
                            headers: {
                            }
                        }, expect(old.processed + 'addon', () => {
                            request({
                                url: url + '/testFile.txt',
                                method: 'GET',
                                headers: {
                                    source: 'T'
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
})