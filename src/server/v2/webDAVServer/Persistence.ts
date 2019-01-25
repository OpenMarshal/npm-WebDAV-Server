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
    const options : IAutoLoad = this.options.autoLoad || {};
    
    if(!options.treeFilePath)
    {
        if(!this.options.autoSave || !this.options.autoSave.treeFilePath)
            return callback(new Error('The "treeFilePath" of the "autoLoad" option is not found.'));
        else
            options.treeFilePath = this.options.autoSave.treeFilePath;
    }

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

function loadDefaultIAutoSaveParam(options : IAutoSave)
{
    if(!options.streamProvider)
        options.streamProvider = (cb) => cb();
    if(!options.onSaveError)
        options.onSaveError = () => {};
    if(!options.tempTreeFilePath)
        options.tempTreeFilePath = options.treeFilePath + '.tmp';

    return options;
}

export class AutoSavePool
{
    constructor(options : IAutoSave, saveFn : (callback : (error : Error, data : any) => void) => void)
    {
        options = loadDefaultIAutoSaveParam(options);

        this.saveRequested = false;
        this.options = options;
        this.saveFn = saveFn;
        this.saving = false;
    }

    protected saveFn : (callback : (error : Error, data : any) => void) => void;
    protected saveRequested : boolean;
    protected saving : boolean;
    protected options : IAutoSave;

    imediateSave()
    {
        this.saveFn((e, data) => {
            if(e)
            {
                this.options.onSaveError(e);
                this.saveIfNext();
            }
            else
            {
                this.options.streamProvider((inputStream, outputStream) => {
                    if(!inputStream)
                        inputStream = zlib.createGzip();
                    if(!outputStream)
                        outputStream = inputStream;
                    const fileStream = fs.createWriteStream(this.options.tempTreeFilePath);
                    outputStream.pipe(fileStream);
    
                    inputStream.end(JSON.stringify(data), (e) => {
                        if(e)
                        {
                            this.options.onSaveError(e);
                            this.saveIfNext();
                            return;
                        }
                    });
    
                    fileStream.on('close', () => {
                        fs.unlink(this.options.treeFilePath, (e) => {
                            if(e && e.code !== 'ENOENT') // An error other than ENOENT (no file/folder found)
                            {
                                this.options.onSaveError(e);
                                this.saveIfNext();
                                return;
                            }
    
                            fs.rename(this.options.tempTreeFilePath, this.options.treeFilePath, (e) => {
                                if(e)
                                    this.options.onSaveError(e);
                                this.saveIfNext();
                            })
                        })
                    })
                })
            }
        })
    }

    save()
    {
        if(this.saving)
        {
            this.saveRequested = true;
        }
        else
        {
            this.saving = true;
            this.imediateSave();
        }
    }

    protected saveIfNext()
    {
        if(this.saveRequested)
        {
            this.saveRequested = false;
            this.imediateSave();
        }
        else
        {
            this.saving = false;
        }
    }
}

export function autoSave(options : IAutoSave)
{
    this.autoSavePool = new AutoSavePool(options, this.save.bind(this));

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
                this.autoSavePool.save();
                break;
        }

        next();
    })
}
