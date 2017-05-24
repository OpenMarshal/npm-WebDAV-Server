"use strict";
var webdav = require('../../lib/index.js');

module.exports = (test, options, index) => test('create server', isValid =>
{
    var server = new webdav.WebDAVServer({
        port: options.port + index
    });
    isValid = isValid.multiple(1, server);

    server.start(options.port + index, (httpServer) => {
        if(httpServer.address().port !== options.port + index)
        {
            isValid(false, 'Wrong port');
            return;
        }

        server.stop(() => {
            server.start((httpServer) => {
                isValid(httpServer.address().port === options.port + index, 'Wrong port');
            });
        })
    });
})