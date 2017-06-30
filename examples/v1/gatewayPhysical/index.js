const webdav = require('webdav-server'),
      phyFsManager = require('./js/PhysicalGFSManager.js'),
      gateway = require('./js/PhysicalGateway.js');

const server = new webdav.WebDAVServer({
    port: 1900,
    autoSave: {
        treeFilePath: './data.json',
        tempTreeFilePath: './data.tmp.json'
    },
    autoLoad: {
        treeFilePath: './data.json',
        fsManagers: [
            new webdav.RootFSManager(),
            new phyFsManager.PhysicalGFSManager(),
            new webdav.VirtualFSManager()
        ]
    }
});

server.autoLoad((e) => {
    if(e)
    {
        server.addResourceTree(new gateway.PhysicalGateway('./testData', 'phyGateway'), (e) => {
            if(e) throw e;

            run();
        });
    }
    else
        run();
})

function run()
{
    server.start((s) => {
        console.log('Server started on port ' + s.address().port + '.');
    });
}