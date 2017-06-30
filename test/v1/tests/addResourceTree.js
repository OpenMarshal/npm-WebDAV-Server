"use strict";
var webdav = require('../../../lib/index.js'),
    Client = require('webdav-fs');

module.exports = (test, options, index) => test('addResourceTree method', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    const url = 'http://127.0.0.1:' + (options.port + index);
    const wfs = Client(url);

    const testFolder = new webdav.VirtualFolder('test');
    server.addResourceTree({
        r: testFolder,
        c: [{
            r: new webdav.VirtualFolder('test1'),
            c: new webdav.VirtualFile('test2')
        }, {
            r: new webdav.VirtualFolder('test2'),
            c: [{
                r: new webdav.VirtualFolder('test1'),
                c: new webdav.VirtualFile('test2')
            },{
                r: new webdav.VirtualFolder('test2'),
                c: new webdav.VirtualFile('test2')
            }]
        }]
    }, (e) => _(e, () => {
        wfs.stat('/test', (e, stat) => _(e, () => {
        wfs.stat('/test/test1', (e, stat) => _(e, () => {
        wfs.stat('/test/test1/test2', (e, stat) => _(e, () => {
        wfs.stat('/test/test2', (e, stat) => _(e, () => {
        wfs.stat('/test/test2/test1', (e, stat) => _(e, () => {
        wfs.stat('/test/test2/test1/test2', (e, stat) => _(e, () => {
        wfs.stat('/test/test2/test2', (e, stat) => _(e, () => {
        wfs.stat('/test/test2/test2/test2', (e, stat) => _(e, () => {
            isValid(true);
        }))
        }))
        }))
        }))
        }))
        }))
        }))
        }))
    }))
    
    server.addResourceTree(testFolder, [{
        r: new webdav.VirtualFolder('2test1'),
        c: new webdav.VirtualFile('2test2')
    }, {
        r: new webdav.VirtualFolder('2test2'),
        c: [{
            r: new webdav.VirtualFolder('2test1'),
            c: new webdav.VirtualFile('2test2')
        },{
            r: new webdav.VirtualFolder('2test2'),
            c: new webdav.VirtualFile('2test2')
        }]
    }], (e) => _(e, () => {
        wfs.stat('/test', (e, stat) => _(e, () => {
        wfs.stat('/test/2test1', (e, stat) => _(e, () => {
        wfs.stat('/test/2test1/2test2', (e, stat) => _(e, () => {
        wfs.stat('/test/2test2', (e, stat) => _(e, () => {
        wfs.stat('/test/2test2/2test1', (e, stat) => _(e, () => {
        wfs.stat('/test/2test2/2test1/2test2', (e, stat) => _(e, () => {
        wfs.stat('/test/2test2/2test2', (e, stat) => _(e, () => {
        wfs.stat('/test/2test2/2test2/2test2', (e, stat) => _(e, () => {
            isValid(true);
        }))
        }))
        }))
        }))
        }))
        }))
        }))
        }))
    }))
})