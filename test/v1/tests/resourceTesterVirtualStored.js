"use strict";
var webdav = require('../../../lib/index.js'),
    path = require('path'),
    fs = require('fs')

module.exports = (test, options, index) => test('resource tester on the virtual stored resources', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);

    const storePath = path.join(__dirname, 'resourceTesterVirtualStored');
    for(const file of fs.readdirSync(storePath))
        if(file !== '.gitkeep')
            fs.unlinkSync(path.join(storePath, file));
    const store = new webdav.VirtualStoredFSManager(new webdav.SimpleVirtualStoredContentManager(storePath));
    store.initialize((e) => {
        if(e)
        {
            isValid(false, e);
            return;
        }

        new webdav.ResourceTester({
            canHaveVirtualFolderChildren: false,
            canHaveVirtualFileChildren: false,
            canGetLastModifiedDate: true,
            canGetCreationDate: true,
            canRemoveChildren: false,
            canHaveChildren: false,
            canGetChildren: false,
            canGetMimeType: true,
            canBeCreated: true,
            canBeDeleted: true,
            canBeRenamed: true,
            canGetSize: true,
            canBeMoved: true,
            canWrite: true,
            canRead: true
        },
            (willCreate, cb) => {
                const vsf = new webdav.VirtualStoredFile('test', null, store);
                if(willCreate)
                    cb(vsf);
                else
                    vsf.create((e) => {
                        if(e) throw e;
                        cb(vsf)
                    })
            }
        ).run((results) => {
            isValid(results.all.isValid, results.all.errors);
        })

        new webdav.ResourceTester({
            canHaveVirtualFolderChildren: true,
            canHaveVirtualFileChildren: true,
            canGetLastModifiedDate: true,
            canGetCreationDate: true,
            canRemoveChildren: true,
            canHaveChildren: true,
            canGetChildren: true,
            canGetMimeType: false,
            canBeCreated: true,
            canBeDeleted: true,
            canBeRenamed: true,
            canGetSize: false,
            canBeMoved: true,
            canWrite: false,
            canRead: false
        },
            (willCreate, cb) => {
                const vsf = new webdav.VirtualStoredFolder('test', null, store);
                if(willCreate)
                    cb(vsf);
                else
                    vsf.create((e) => {
                        if(e) throw e;
                        cb(vsf)
                    })
            }
        ).run((results) => {
            isValid(results.all.isValid, results.all.errors);
        })
    })
})