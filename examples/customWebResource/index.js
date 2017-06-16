const webFsManager = require('./js/fsManager.js'),
      webFile = require('./js/resource.js'),
      webdav = require('webdav-server'),
      zlib = require('zlib'),
      fs = require('fs');

const server = new webdav.WebDAVServer({
    port: 1900,
    autoSave: {
        treeFilePath: './data.json',
        tempTreeFilePath: './data.tmp.json'
    }
});

fs.readFile('./data.json', (e, data) => {
    if(e)
    {
        defaultLoad();
        return;
    }
    
    zlib.gunzip(data, (e, data) => {
        if(e)
        {
            defaultLoad();
            return;
        }
        data = JSON.parse(data.toString());

        server.load(data, [
            new webdav.RootFSManager(),
            new webFsManager.WebFSManager(),
            new webdav.VirtualFSManager()
        ], (e) => {
            if(e)
                defaultLoad();
            else
                run();
        })
    })
})

function defaultLoad()
{
    server.addResourceTree([
        new webFile.WebFile('http://unlicense.org/UNLICENSE', 'license.txt'),
        new webFile.WebFile('https://github.com/OpenMarshal/npm-WebDAV-Server', 'webdav-server-github.html'),
        new webFile.WebFile('http://www.stuffedcupcakes.com/wp-content/uploads/2013/05/Chocolate-Overload.jpg', 'chocolate.jpg')
    ], (e) => {
        if(e) throw e;

        run();
    });
}

function run()
{
    server.start((s) => {
        console.log('Server started on port ' + s.address().port + '.');
    });
}
