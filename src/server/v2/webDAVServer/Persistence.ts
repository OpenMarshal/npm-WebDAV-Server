//import { RootFSManager, VirtualFSManager, PhysicalFSManager } from '../../manager/export'
import { FileSystem } from '../../../manager/v2/fileSystem/FileSystem'
import { SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { FileSystemSerializer, serialize, unserialize, SerializedData } from '../../../manager/v2/fileSystem/Serialization'
import { VirtualSerializer } from '../../../manager/v2/instances/VirtualFileSystem'
import { RequestContext } from '../RequestContext'
import { IAutoSave, IAutoLoad } from '../WebDAVServerOptions'
import { Readable } from 'stream'
import * as zlib from 'zlib'
import * as fs from 'fs'

function defaultSerializers()
{
    return [
        new VirtualSerializer()
    ];
}

export function load(data : SerializedData, serializers : FileSystemSerializer[], callback: (error : Error) => void)
{
    serializers = serializers ? serializers : defaultSerializers();
    
    unserialize(data, serializers, (e, udata) => {
        this.fileSystems = udata;
    })
}

export function autoLoad(callback : SimpleCallback)
{
    const options : IAutoLoad = this.options.autoLoad;
    const oStream = fs.createReadStream(options.treeFilePath);
    const stream = oStream.pipe(zlib.createGunzip());
    
    oStream.on('error', callback)
    stream.on('error', callback)

    let streamProvider = options.streamProvider;

    if(!streamProvider)
        streamProvider = (s, cb) => cb(s);
    
    streamProvider(stream, (s : Readable) => {
        if(!s)
            s = stream;
        
        let data = '';
        s.on('data', (chunk) => {
            data += chunk.toString();
        })
        s.on('error', callback)
        s.on('end', () => {
            const obj = JSON.parse(data.toString());
            this.load(obj, options.serializers, callback);
        })
    })
}

export function save(callback : (error : Error, obj : SerializedData) => void)
{
    serialize(this.fileSystems, callback);
}

export function autoSave(options : IAutoSave)
{
    if(!options.streamProvider)
        options.streamProvider = (s, cb) => cb(s);
    if(!options.onSaveError)
        options.onSaveError = () => {};

    let saving = false;
    let saveRequested = false;
    this.afterRequest((ctx : RequestContext, next) => {
        switch(ctx.request.method.toUpperCase())
        {
            case 'PROPPATCH':
            case 'DELETE':
            case 'MKCOL':
            case 'MOVE':
            case 'COPY':
            case 'POST':
            case 'PUT':
                // Avoid concurrent saving
                if(saving)
                {
                    saveRequested = true;
                    next();
                    return;
                }

                const save = function()
                {
                    this.save((e, data) => {
                        if(e)
                        {
                            options.onSaveError(e);
                            next();
                        }
                        else
                        {
                            const stream = zlib.createGzip();
                            options.streamProvider(stream, (outputStream) => {
                                if(!outputStream)
                                    outputStream = stream;
                                outputStream.pipe(fs.createWriteStream(options.tempTreeFilePath));

                                stream.end(JSON.stringify(data), (e) => {
                                    if(e)
                                    {
                                        options.onSaveError(e);
                                        next();
                                        return;
                                    }
                                });

                                stream.on('close', () => {
                                    fs.unlink(options.treeFilePath, (e) => {
                                        if(e && e.code !== 'ENOENT') // An error other than ENOENT (no file/folder found)
                                        {
                                            options.onSaveError(e);
                                            next();
                                            return;
                                        }

                                        fs.rename(options.tempTreeFilePath, options.treeFilePath, (e) => {
                                            if(e)
                                                options.onSaveError(e);
                                            next();
                                        })
                                    })
                                })
                            })
                        }
                    })
                }

                saving = true;
                next = () => {
                    if(saveRequested)
                    {
                        saveRequested = false;
                        save.bind(this)();
                    }
                    else
                        saving = false;
                }
                save.bind(this)();
                break;
            
            default:
                next();
                break;
        }
    })
}
