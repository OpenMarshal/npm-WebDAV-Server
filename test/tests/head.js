"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request')

module.exports = function(test, options, index) { test('HEAD method', function(isValid)
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);
    const _ = function(e, cb) {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    request({
        url: 'http://localhost:' + (options.port + index),
        method: 'HEAD'
    }, function(e, res, body) {
        isValid(!e && res.statusCode !== 200);
    })

    server.rootResource.addChild(new webdav.VirtualFile('file'), function(e) { _(e, function() {
        request({
            url: 'http://localhost:' + (options.port + index) + '/file',
            method: 'HEAD'
        }, function(e, res, body) {
            isValid(!e && res.statusCode === 200);
        })
    })})
})}