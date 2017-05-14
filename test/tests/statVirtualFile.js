var webdav = require('../../lib/index.js'),
    Client = require('webdav-fs'),
    request = require('request'),
    xml2js = require('xml2js')

module.exports = (test, options, index) => test('stat of virtual file', isValid =>
{
    var server = new webdav.WebDAVServer();
    isValid = isValid.multiple(2, server);
    server.rootResource.addChild(new webdav.VirtualFile('testFile.txt'), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        server.start(options.port + index);

        var wfs = Client(
            "http://127.0.0.1:" + (options.port + index)
        );

        wfs.stat('/testFile.txt', (e, stat) => {
            isValid(!e && stat.name === 'testFile.txt');
        })

        wfs.stat('/notFoundFile.txt', (e, stat) => {
            isValid(!!e);
        })

        function propfind(callback)
        {
            request({
                url: "http://127.0.0.1:" + (options.port + index) + '/testFile.txt',
                method: 'PROPFIND'
            }, (e, res, body) => {
                if(e)
                {
                    isValid(false, e);
                    return;
                }

                xml2js.parseString(body, (e, doc) => {
                    if(e)
                        isValid(false, e);
                    else
                        callback(doc);
                });
            })
        }
    });
})