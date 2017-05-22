"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request');

module.exports = function(test, options, index) { test('date', function(isValid)
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

    request({
        url: 'http://localhost:' + (options.port + index) + '/',
        method: 'OPTIONS'
    }, function(e, res, body) { _(e, function() {
        isValid(Object.keys(res.headers).some(function(n) {
            return n.toLowerCase() === 'date';
        }), 'The \'date\' header is missing in the response');
    })});
})}