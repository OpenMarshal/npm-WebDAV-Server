"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('authentication', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.userManager.addUser('usernameX', 'password');

    const url = 'http://127.0.0.1:' + (options.port + index);

    const wfs = Client(url, 'usernameX', 'password');

    server.rootResource.addChild(new webdav.VirtualFolder('test'), e => _(e, () => {
        wfs.stat('/test', (e, stat) => {
            isValid(!e);
        })
        
        const wfs2 = Client(url, 'invalidUsername', 'password');
        
        wfs2.stat('/test', (e, stat) => {
            isValid(!!e);
        })
    }))
})