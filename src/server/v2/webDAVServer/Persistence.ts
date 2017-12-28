import { FileSystemSerializer, serialize, unserialize, SerializedData } from '../../../manager/v2/fileSystem/Serialization'
import { PhysicalSerializerVersions } from '../../../manager/v2/instances/PhysicalFileSystem'
import { VirtualSerializerVersions } from '../../../manager/v2/instances/VirtualFileSystem'
import { IAutoSave, IAutoLoad } from '../WebDAVServerOptions'
import { HTTPRequestContext } from '../RequestContext'
import { SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { Readable } from 'stream'
import * as zlib from 'zlib'
import * as fs from 'fs'

function defaultSerializers()
{
    return VirtualSerializerVersions.instances.concat(PhysicalSerializerVersions.instances);
}

export function load(data : SerializedData, serializers : FileSystemSerializer[], callback: (error : Error) => void)
{
    const fSerializers = serializers ? serializers.concat(defaultSerializers()) : defaultSerializers();
    
    unserialize(data, fSerializers, (e, udata) => {
        if(!e)
            this.fileSystems = udata;
        callback(e);
    })
}

export function autoLoad(callback : SimpleCallback)
{
    let options : IAutoLoad = this.options.autoLoad;
    if(!options)
        options = { } as IAutoLoad;
    if(!options.treeFilePath)
        if(!this.options.autoSave || !this.options.autoSave.treeFilePath)
            return callback(new Error('The "treeFilePath" of the "autoLoad" option is not found.'));
        else
            options.treeFilePath = this.options.autoSave.treeFilePath;

    const stream = fs.createReadStream(options.treeFilePath);
    
    stream.on('error', callback)

    let streamProvider = options.streamProvider;

    if(!streamProvider)
        streamProvider = (s, cb) => cb(s.pipe(zlib.createGunzip()));
    
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
        options.streamProvider = (cb) => cb();
    if(!options.onSaveError)
        options.onSaveError = () => {};
    if(!options.tempTreeFilePath)
        options.tempTreeFilePath = options.treeFilePath + '.tmp';

    let saving = false;
    let saveRequested = false;
    this.afterRequest((ctx : HTTPRequestContext, next) => {
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
                            options.streamProvider((inputStream, outputStream) => {
                                if(!inputStream)
                                    inputStream = zlib.createGzip();
                                if(!outputStream)
                                    outputStream = inputStream;
                                const fileStream = fs.createWriteStream(options.tempTreeFilePath);
                                outputStream.pipe(fileStream);

                                inputStream.end(JSON.stringify(data), (e) => {
                                    if(e)
                                    {
                                        options.onSaveError(e);
                                        next();
                                        return;
                                    }
                                });

                                fileStream.on('close', () => {
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
