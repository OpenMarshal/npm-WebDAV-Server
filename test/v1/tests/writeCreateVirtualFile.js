"use strict";
var request = require('request'),
    stream = require('stream'),
    Client = require('webdav-fs')

module.exports = (test, options, index) => test('write/create a virtual file', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    var wfs = Client(
        'http://127.0.0.1:' + (options.port + index)
    );

    const fileName = 'file.txt';
    wfs.writeFile('/' + fileName, new Buffer(0), (e) => _(e, () => {
        wfs.stat('/' + fileName, (e) => {
            isValid(!e)
        })
    }))

    const content = 'This is the content of the file!';
    const str = new stream.PassThrough();
    str.end(content);
    const destStream = request({
        url: 'http://localhost:' + (options.port + index) + '/newFile.txt',
        method: 'PUT'
    });
    destStream.on('complete', (res, body) => {
        wfs.readFile('/newFile.txt', (e, c) => _(e, () => {
            isValid(c.toString() === content.toString(), 'The content written with streaming must create and store the content.');
        }))
    })
    str.pipe(destStream);
})