"use strict";
var webdav = require('../../lib/index.js');

module.exports = function(test, options, index) { test('create server', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);

    server.stop(function() {
        isValid(true);
    })
})}