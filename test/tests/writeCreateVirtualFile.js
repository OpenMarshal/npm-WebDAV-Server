"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs')

module.exports = function(test, options, index) { test('write/create a virtual file', function(isValid)
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

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const fileName = 'file.txt';
    wfs.writeFile('/' + fileName, new Buffer(0), function(e) { _(e, function() {
        wfs.stat('/' + fileName, function(e) {
            isValid(!e)
        })
    })})
})}