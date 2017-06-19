const webdav = require('webdav-server'),
      ftpFsManager = require('./js/fsManager.js'),
      ftpResource = require('./js/ftpGateway.js');
    
const ftpConfig = {
    host: '127.0.0.1',
    port: 21,
    connTimeout: 1000,
    pasvTimeout: 1000,
    user: 'test'
};

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
            new ftpFsManager.FTPFSManager(ftpConfig),
            new webdav.VirtualFSManager()
        ]
    }
});

server.autoLoad((e) => {
    if(e)
    {
        server.addResourceTree(new ftpResource.FTPGateway(ftpConfig, '/', 'ftpGateway'), (e) => {
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