const webFile = require('./js/resource.js'),
      webdav = require('webdav-server');

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
    canWrite: false,
    canRead: true,
    canLock: true
},
    // For each battery of tests, create the resource to test
    // willCreate : A value of true means you must not call the '.create(...)' method because it will be tested
    (willCreate, cb) => cb(new webFile.WebFile('http://unlicense.org/UNLICENSE', 'test.txt'))
).run((results) => {

    // Display the results of the tests
    console.log(results.all.isValid ? 'Tests passed!' : 'Tests failed!');
    if(results.all.errors)
        for(const value of results.all.errors)
            console.log(value.toString());
});
