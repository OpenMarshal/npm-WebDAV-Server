const webdav = require('webdav-server');

webdav.PhysicalFolder.loadFromPath('./data', (e, folder) => {
    if(e) throw e;

    const server = new webdav.WebDAVServer({
        port: 1900
    });

    server.addResourceTree(folder, (e) => {
        if(e) throw e;

        server.start((s) => {
            console.log('Server started on port ' + s.address().port + '.');
        });
    });
});
