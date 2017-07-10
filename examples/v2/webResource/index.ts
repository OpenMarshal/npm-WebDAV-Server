import { v2 } from 'webdav-server'
import * as request from 'request'
import { Readable } from 'stream'

// Serializer
class WebFileSystemSerializer implements v2.FileSystemSerializer
{
    uid() : string
    {
        return 'WebFileSystemSerializer_1.0.0';
    }

    serialize(fs : WebFileSystem, callback : v2.ReturnCallback<any>) : void
    {
        callback(null, {
            url: fs.url,
            props: fs.props
        });
    }

    unserialize(serializedData : any, callback : v2.ReturnCallback<WebFileSystem>) : void
    {
        const fs = new WebFileSystem(serializedData.url);
        fs.props = new v2.LocalPropertyManager(serializedData.props);
        callback(null, fs);
    }
}

// File system
class WebFileSystem extends v2.FileSystem
{
    props : v2.IPropertyManager;
    locks : v2.ILockManager;

    constructor(public url : string)
    {
        super(new WebFileSystemSerializer());
        
        this.props = new v2.LocalPropertyManager();
        this.locks = new v2.LocalLockManager();
    }

    _fastExistCheck(ctx : v2.RequestContext, path : v2.Path, callback : (exists : boolean) => void) : void
    {
        callback(path.isRoot());
    }

    _openReadStream(path : v2.Path, info : v2.OpenReadStreamInfo, callback : v2.ReturnCallback<Readable>) : void
    {
        const stream = request.get(this.url);
        stream.end();
        callback(null, (stream as any) as Readable);
    }

    _propertyManager(path : v2.Path, info : v2.PropertyManagerInfo, callback : v2.ReturnCallback<v2.IPropertyManager>) : void
    {
        callback(null, this.props);
    }

    _lockManager(path : v2.Path, info : v2.LockManagerInfo, callback : v2.ReturnCallback<v2.ILockManager>) : void
    {
        callback(null, this.locks);
    }

    _type(path : v2.Path, info : v2.TypeInfo, callback : v2.ReturnCallback<v2.ResourceType>) : void
    {
        callback(null, v2.ResourceType.File);
    }
}

// Server instantiation
const server = new v2.WebDAVServer();
server.setFileSystemSync('/chocolate.jpg', new WebFileSystem('http://www.stuffedcupcakes.com/wp-content/uploads/2013/05/Chocolate-Overload.jpg'));
server.setFileSystemSync('/webdav-server-github.html', new WebFileSystem('https://github.com/OpenMarshal/npm-WebDAV-Server'));
server.setFileSystemSync('/license.txt', new WebFileSystem('http://unlicense.org/UNLICENSE'));
server.start((s) => console.log('Ready on port', s.address().port));
