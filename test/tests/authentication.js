"use strict";
var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = function(test, options, index) { test('authentication', function(isValid)
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
    
    server.userManager.addUser('usernameX', 'password');

    const url = 'http://127.0.0.1:' + (options.port + index);

    const wfs = Client(url, 'usernameX', 'password');

    server.rootResource.addChild(new webdav.VirtualFolder('test'), function(e) { _(e, function() {
        wfs.stat('/test', function(e, stat) {
            isValid(!e);
        })
        
        const wfs2 = Client(url, 'invalidUsername', 'password');
        
        wfs2.stat('/test', function(e, stat) {
            isValid(!!e);
        })
    })})
})}