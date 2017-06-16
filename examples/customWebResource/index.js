const webFile = require('./js/resource.js'),
      webdav = require('webdav-server');

const server = new webdav.WebDAVServer({
    port: 1900
});

server.addResourceTree([
    new webFile.WebFile('http://unlicense.org/UNLICENSE', 'license.txt'),
    new webFile.WebFile('https://github.com/OpenMarshal/npm-WebDAV-Server', 'webdav-server-github.html'),
    new webFile.WebFile('http://www.stuffedcupcakes.com/wp-content/uploads/2013/05/Chocolate-Overload.jpg', 'chocolate.jpg')
], (e) => {
    if(e) throw e;

    server.start((s) => {
        console.log('Server started on port ' + s.address().port + '.');
    });
});
