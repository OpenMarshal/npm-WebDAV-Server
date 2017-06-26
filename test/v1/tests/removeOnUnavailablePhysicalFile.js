"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs'),
    request = require('request'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('remove a physical file when unavailable', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const fileName = 'file.txt';
    const filePath = path.join(__dirname, 'removeOnUnavailablePhysicalFile', fileName);
    const file = new webdav.PhysicalFile(filePath);
    server.rootResource.addChild(file, e => _(e, () => {
        // file.removeOnUnavailableSource = false; <= default
        wfs.readdir('/', (e, files) => {
            if(!e)
                isValid(false, 'The source file is not available, the server must return a 500 Internal Server Error.');
            else
            {
                file.removeOnUnavailableSource = true;
                request({
                    url: 'http://127.0.0.1:' + (options.port + index) + '/',
                    method: 'PROPFIND',
                    headers: {
                        Depth: 1
                    }
                }, (e, res, body) => {
                    if(e || res.statusCode >= 300)
                        isValid(false, e ? e : res.statusCode + ' ' + res.statusMessage)
                    else
                        isValid(body.split(/<[a-zA-Z]:response>/g).length === 2, 'The child must not be displayed.');
                })
            }
        })
    }));
})