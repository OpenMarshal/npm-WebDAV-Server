"use strict";
var webdav = require('../../../lib/index.js')

module.exports = (test, options, index) => test('resource tester on the virtual resources', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);

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
        (willCreate, cb) => cb(new webdav.VirtualFile('test'))
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
        (willCreate, cb) => cb(new webdav.VirtualFolder('test'))
    ).run((results) => {
        isValid(results.all.isValid, results.all.errors);
    })
})