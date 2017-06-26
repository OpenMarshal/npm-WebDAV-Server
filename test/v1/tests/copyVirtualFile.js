"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('copy a virtual file', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const fileName = 'test.txt';
    const fileNameDest = 'test2.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), e => _(e, () => {
        request({
            url: url + '/' + fileName,
            method: 'COPY',
            headers: {
                destination: url + '/' + fileNameDest
            }
        }, (e, res, body) => _(e, () => {
            wfs.stat('/' + fileName, (e, stat) => _(e, () => {
                wfs.stat('/' + fileNameDest, (e, stat) => _(e, () => {
                    request({
                        url: url + '/' + fileName,
                        method: 'COPY',
                        headers: {
                            destination: url + '/' + fileNameDest
                        }
                    }, (e, res, body) => _(e, () => {
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
                        }, (e, res, body) => _(e, () => {
                            isValid(res.statusCode >= 300, 'Overrided but must not');
                        }));
                    }));
                }))
            }))
        }));
    }));
})