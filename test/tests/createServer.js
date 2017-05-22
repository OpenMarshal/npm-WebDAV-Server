"use strict";
var webdav = require('../../lib/index.js');

module.exports = (test, options, index) => test('create server', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);

    server.stop(() => {
        isValid(true);
    })
})