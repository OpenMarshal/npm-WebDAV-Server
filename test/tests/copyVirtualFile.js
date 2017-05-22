"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request'),
    Client = require('webdav-fs');

module.exports = function(test, options, index) { test('copy a virtual file', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const fileName = 'test.txt';
    const fileNameDest = 'test2.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName),function(e) { _(e, function() {
        request({
            url: url + '/' + fileName,
            method: 'COPY',
            headers: {
                destination: url + '/' + fileNameDest
            }
        }, function(e, res, body) { _(e, function() {
            wfs.stat('/' + fileName, function(e, stat) { _(e, function() {
                wfs.stat('/' + fileNameDest, function(e, stat) { _(e, function() {
                    request({
                        url: url + '/' + fileName,
                        method: 'COPY',
                        headers: {
                            destination: url + '/' + fileNameDest
                        }
                    }, function(e, res, body) { _(e, function() {
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
                        }, function(e, res, body) { _(e, function() {
                            isValid(res.statusCode >= 300, 'Overrided but must not');
                        })});
                    })});
                })})
            })})
        })});
    })});
})}