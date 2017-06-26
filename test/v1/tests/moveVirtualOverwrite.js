"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('move a virtual resource (overwrite test)', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    function move(source, dest, overwrite, callback)
    {
        request({
            url: 'http://localhost:' + (options.port + index) + source,
            method: 'MOVE',
            headers: {
                Destination: 'http://localhost:' + (options.port + index) + dest,
                Overwrite: overwrite ? 'T' : 'F'
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
    const fileNameDest = 'file.dest.txt';
    server.addResourceTree([
        new webdav.VirtualFile(fileName),
        new webdav.VirtualFile(fileNameDest),
    ], e => _(e, () => {
        move('/' + fileName, '/' + fileNameDest, false, (moved) => {
            if(moved)
            {
                isValid(false, 'Must not overwrite a file resource when not allowed in the headers.');
                return;
            }

            exist('/' + fileName, (exists) => {
                if(!exists)
                {
                    isValid(false, 'The file must still exist after a failed move');
                    return;
                }

                exist('/' + fileNameDest, (exists) => {
                    isValid(exists, 'The destination file must still exist after a failed move');
                })
            })
        })
    }));

    const fileName2 = 'file2.txt';
    const fileNameDest2 = 'file2.dest.txt';
    server.addResourceTree([
        new webdav.VirtualFile(fileName2),
        new webdav.VirtualFile(fileNameDest2),
    ], e => _(e, () => {
        move('/' + fileName2, '/' + fileNameDest2, true, (moved) => {
            if(!moved)
            {
                isValid(false, 'Must overwrite a file resource when allowed in the headers.');
                return;
            }

            exist('/' + fileName2, (exists) => {
                if(exists)
                {
                    isValid(false, 'The file must have been moved, but still exists at its old url');
                    return;
                }

                exist('/' + fileNameDest2, (exists) => {
                    isValid(exists, 'The destination file must be replaced by the source resource');
                })
            })
        })
    }));
})