"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('move a virtual resource', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    function move(source, dest, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + source,
            method: 'MOVE',
            headers: {
                Destination: 'http://localhost:' + (options.port + index) + dest
            }
        }, (e, res, body) => _(e, () => {
            callback(res.statusCode < 300);
        }))
    }

    function exist(path, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + path,
            method: 'PROPFIND'
        }, (e, res, body) => _(e, () => {
            callback(res.statusCode < 300);
        }))
    }

    const fileName = 'file.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), e => _(e, () => {
        move('/file.txt', '/file2.txt', (moved) => {
            if(!moved)
            {
                isValid(false);
                return;
            }

            exist('/file.txt', (exists) => {
                if(exists)
                {
                    isValid(false, 'The file must not exist');
                    return;
                }

                exist('/file2.txt', (exists) => {
                    isValid(exists, 'The file must exist');
                })
            })
        })
    }));

    const folderName = 'folder';
    server.rootResource.addChild(new webdav.VirtualFolder(folderName), e => _(e, () => {
        move('/folder', '/folder2', (moved) => {
            if(!moved)
            {
                isValid(false);
                return;
            }

            exist('/folder', (exists) => {
                if(exists)
                {
                    isValid(false, 'The folder must not exist');
                    return;
                }

                exist('/folder2', (exists) => {
                    isValid(exists, 'The folder must exist');
                })
            })
        })
    }));
    
    move('/fileXXX.txt', '/file2XXX.txt', (moved) => {
        isValid(!moved);
    })
})