"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request')

module.exports = function(test, options, index) { test('OPTIONS method', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(1, server);

    request({
        url: 'http://localhost:' + (options.port + index),
        method: 'OPTIONS'
    }, function(e, res, body) {
        isValid(!e && res.headers.allow && res.headers.allow.length >= 3 && /^[a-zA-Z,]+$/g.test(res.headers.allow));
    })
})}