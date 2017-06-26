"use strict";
var webdav = require('../../../lib/index.js'),
    path = require('path'),
    fs = require('fs')

function clearFolder(rootFolder)
{
    const files = fs.readdirSync(rootFolder);
    for(let f of files)
    {
        if(f === '.gitkeep')
            continue;
        
        f = path.join(rootFolder, f);
        const s = fs.statSync(f);
        if(s.isFile())
            fs.unlinkSync(f);
        else
        {
            clearFolder(f);
            fs.rmdirSync(f);
        }
    }
}

module.exports = (test, options, index) => test('resource tester on the physical resources', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);

    const rootFolder = path.join(__dirname, 'resourceTesterPhysical');
    clearFolder(rootFolder);

    let fid = 0;
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
            const name = path.join(rootFolder, 'testFile' + (++fid).toString());
            fs.writeFile(name, '', () => {
                cb(new webdav.PhysicalFile(name))
            })
        }
    ).run((results) => {
        isValid(results.all.isValid, results.all.errors);
    })

    let fid2 = 0;
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
            const name = path.join(rootFolder, 'testFolder' + (++fid2).toString());
            if(!willCreate)
            {
                fs.mkdir(name, () => {
                    cb(new webdav.PhysicalFolder(name))
                })
            }
            else
                cb(new webdav.PhysicalFolder(name))
        }
    ).run((results) => {
        isValid(results.all.isValid, results.all.errors);
    })
})