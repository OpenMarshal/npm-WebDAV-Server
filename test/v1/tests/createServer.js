"use strict";
var webdav = require('../../../lib/index.js');

module.exports = (test, options, index) => test('create server', (isValid, server) =>
{
    var server2 = new webdav.WebDAVServer({
        port: options.port + index
    });
    isValid = isValid.multiple(1, server2);

    server.stop(() => {
        server2.start(options.port + index, (httpServer) => {
            if(httpServer.address().port !== options.port + index)
            {
                isValid(false, 'Wrong port');
                return;
            }

            server2.stop(() => {
                server2.start((httpServer) => {
                    isValid(httpServer.address().port === options.port + index, 'Wrong port');
                });
            })
        });
    });
})