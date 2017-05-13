var webdav = require('../../lib/index.js'),
    Client = require("webdav-fs")

module.exports = (test, options, index) => test('delete a virtual folder', isValid =>
{
    var server = new webdav.WebDAVServer();
    server.start(options.port + index);
    isValid = isValid.multiple(2, server);

    var wfs = Client(
        "http://127.0.0.1:" + (options.port + index)
    );

    const folderName = 'folder';
    server.rootResource.addChild(new webdav.VirtualFolder(folderName), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        wfs.stat('/' + folderName, (e, stat) => {
            if(e)
            {
                isValid(false, e)
                return;
            }
            
            wfs.unlink('/' + folderName, (e) => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                wfs.stat('/' + folderName, (e, stat) => {
                    isValid(!!e)
                })
            })
        })
    });

    const folderName2 = 'notEmptyFolder';
    const vd = new webdav.VirtualFolder(folderName2);
    vd.addChild(new webdav.VirtualFolder('folder'), e => {
        if(e)
        {
            isValid(false, e)
            return;
        }

        vd.addChild(new webdav.VirtualFile('file.txt'), e => {
            if(e)
            {
                isValid(false, e)
                return;
            }

            server.rootResource.addChild(vd, e => {
                if(e)
                {
                    isValid(false, e)
                    return;
                }

                wfs.stat('/' + folderName2, (e, stat) => {
                    if(e)
                    {
                        isValid(false, e)
                        return;
                    }
                    
                    wfs.unlink('/' + folderName2, (e) => {
                        if(e)
                        {
                            isValid(false, e)
                            return;
                        }

                        wfs.stat('/' + folderName2, (e, stat) => {
                            isValid(!!e)
                        })
                    })
                })
            });
        });
    });
})