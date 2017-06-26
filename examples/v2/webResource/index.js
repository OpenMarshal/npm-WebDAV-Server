const webdav = require('webdav-server').v2,
      request = require('request');

// Serializer
function WebFileSystemSerializer()
{
    return {
        uid()
        {
            return "WebFileSystemSerializer_1.0.0";
        },
        serialize(fs, callback)
        {
            callback(null, {
                url: fs.url,
                props: fs.props
            });
        },
        unserialize(serializedData, callback)
        {
            const fs = new WebFileSystem(serializedData.url);
            fs.props = serializedData.props;
            callback(null, fs);
        },
        constructor: WebFileSystemSerializer
    }
}

// File system
function WebFileSystem(url)
{
    const r = new webdav.FileSystem(new WebFileSystemSerializer());
    r.constructor = WebFileSystem;
    r.props = new webdav.LocalPropertyManager();
    r.locks = new webdav.LocalLockManager();
    r.url = url;

    r._fastExistCheck = function(ctx, path, callback)
    {
        callback(path.isRoot());
    }

    r._openReadStream = function(path, info, callback)
    {
        const stream = request.get(this.url);
        stream.end();
        callback(null, stream);
    }

    r._propertyManager = function(path, info, callback)
    {
        callback(null, this.props);
    }

    r._lockManager = function(path, info, callback)
    {
        callback(null, this.locks);
    }

    r._type = function(path, info, callback)
    {
        callback(null, webdav.ResourceType.File);
    }

    return r;
}

// Server instantiation
const server = new webdav.WebDAVServer();
server.setFileSystemSync('/chocolate.jpg', new WebFileSystem('http://www.stuffedcupcakes.com/wp-content/uploads/2013/05/Chocolate-Overload.jpg'));
server.setFileSystemSync('/webdav-server-github.html', new WebFileSystem('https://github.com/OpenMarshal/npm-WebDAV-Server'));
server.setFileSystemSync('/license.txt', new WebFileSystem('http://unlicense.org/UNLICENSE'));
server.start((s) => console.log('Ready on port', s.address().port));
