"use strict";
var webdav = require('../../lib/index.js'),
    request = require('request')

module.exports = function(test, options, index) { test('move a virtual resource', function(isValid)
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

    function move(source, dest, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + source,
            method: 'MOVE',
            headers: {
                Destination: 'http://localhost:' + (options.port + index) + dest
            }
        }, function(e, res, body) { _(e, function() {
            callback(res.statusCode < 300);
        })})
    }

    function exist(path, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + path,
            method: 'PROPFIND'
        }, function(e, res, body) { _(e, function() {
            callback(res.statusCode < 300);
        })})
    }

    const fileName = 'file.txt';
    server.rootResource.addChild(new webdav.VirtualFile(fileName), function(e) { _(e, function() {
        move('/file.txt', '/file2.txt', function(moved) {
            if(!moved)
            {
                isValid(false);
                return;
            }

            exist('/file.txt', function(exists) {
                if(exists)
                {
                    isValid(false, 'The file must not exist');
                    return;
                }

                exist('/file2.txt', function(exists) {
                    isValid(exists, 'The file must exist');
                })
            })
        })
    })});

    const folderName = 'folder';
    server.rootResource.addChild(new webdav.VirtualFolder(folderName), function(e) { _(e, function() {
        move('/folder', '/folder2', function(moved) {
            if(!moved)
            {
                isValid(false);
                return;
            }

            exist('/folder', function(exists) {
                if(exists)
                {
                    isValid(false, 'The folder must not exist');
                    return;
                }

                exist('/folder2', function(exists) {
                    isValid(exists, 'The folder must exist');
                })
            })
        })
    })});
    
    move('/fileXXX.txt', '/file2XXX.txt', function(moved) {
        isValid(!moved);
    })
})}