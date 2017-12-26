import { IResource, ResourceType, ReturnCallback, SimpleCallback } from '../../resource/v1/IResource'
import { VirtualStoredFolder } from '../../resource/v1/virtualStored/VirtualStoredFolder'
import { Readable, Writable } from 'stream'
import { VirtualStoredFile } from '../../resource/v1/virtualStored/VirtualStoredFile'
import { SerializedObject } from './ISerializer'
import { FSManager } from './FSManager'
import { Errors } from '../../Errors'
import * as path from 'path'
import * as fs from 'fs'

export interface IVirtualStoredContentManager
{
    uid : string
    
    initialize(callback : (error : Error) => void)

    read(contentUid : string, callback : ReturnCallback<Readable>)
    write(contentUid : string, callback : ReturnCallback<Writable>)

    deallocate(contentId : string, callback : SimpleCallback);

    allocate(callback : ReturnCallback<string>);
    allocate(options : any, callback : ReturnCallback<string>)
}
export abstract class VirtualStoredContentManager implements IVirtualStoredContentManager
{
    uid : string

    abstract initialize(callback : (error : Error) => void)
    abstract read(contentUid : string, callback : ReturnCallback<Readable>)
    abstract write(contentUid : string, callback : ReturnCallback<Writable>)
    protected abstract _allocate(options : any, callback : ReturnCallback<string>)
    abstract deallocate(contentId : string, callback : SimpleCallback);

    allocate(callback : ReturnCallback<string>);
    allocate(options : any, callback : ReturnCallback<string>)
    allocate(options : any, callback ?: ReturnCallback<string>)
    {
        let _options : any;
        let _callback : ReturnCallback<string>;

        if(options.constructor === Function)
        {
            _options = { };
            _callback = options;
        }
        else
        {
            _options = options;
            _callback = callback;
        }

        this._allocate(_options, _callback);
    }
}

export interface IVirtualStoredContentManagerMiddleware
{
    readStream(uid : string, stream : Readable, callback : (stream : Readable) => void);
    writeStream(uid : string, stream : Writable, callback : (stream : Writable) => void);
}

export class SimpleVirtualStoredContentManager extends VirtualStoredContentManager
{
    initialized : boolean = false;
    uid : string = 'SimpleVirtualStoredContentManager_1.3.3';
    cid : number = 0;

    constructor(public storeFolderPath : string, public middleware ?: IVirtualStoredContentManagerMiddleware)
    {
        super();
    }

    initialize(callback : (error : Error) => void)
    {
        fs.readdir(this.storeFolderPath, (e, files) => {
            if(e)
            {
                process.nextTick(() => callback(e));
                return;
            }

            for(const file of files)
            {
                try
                {
                    const value = parseInt(file, 16);
                    if(value && this.cid < value)
                        this.cid = value;
                }
                catch(ex)
                { }
            }
            this.initialized = true;
            process.nextTick(() => callback(null));
        })
    }
    
    read(contentUid : string, _callback : ReturnCallback<Readable>)
    {
        const callback = (_1, _2) => process.nextTick(() => _callback(_1, _2));

        fs.open(path.join(this.storeFolderPath, contentUid), 'r', (e, fd) => {
            if(e)
                callback(e, null);
            else
            {
                const stream = fs.createReadStream(null, { fd });
                if(!this.middleware)
                    callback(null, stream);
                else
                    this.middleware.readStream(contentUid, stream, (s) => callback(null, s));
            }
        })
    }

    write(contentUid : string, _callback : ReturnCallback<Writable>)
    {
        const callback = (_1, _2) => process.nextTick(() => _callback(_1, _2));

        fs.open(path.join(this.storeFolderPath, contentUid), 'w', (e, fd) => {
            if(e)
                callback(e, null);
            else
            {
                const stream = fs.createWriteStream(null, { fd });
                if(!this.middleware)
                    callback(null, stream);
                else
                    this.middleware.writeStream(contentUid, stream, (s) => callback(null, s));
            }
        })
    }
    
    deallocate(uid : string, callback : SimpleCallback)
    {
        fs.unlink(path.join(this.storeFolderPath, uid), callback);
    }

    protected _allocate(options : any, _callback : ReturnCallback<string>)
    {
        const callback = (_1, _2) => process.nextTick(() => _callback(_1, _2));

        if(!this.initialized)
            throw new Error('SimpleVirtualStoredContentManager not initialized');
        
        const uid = (++this.cid).toString(16);

        fs.open(path.join(this.storeFolderPath, uid), 'w+', (e, fd) => {
            if(e)
                callback(e, null);
            else
                fs.close(fd, (e) => {
                    callback(e, uid);
                })
        })
    }
}

export class VirtualStoredFSManager implements FSManager
{
    contentManager : IVirtualStoredContentManager;
    uid : string;

    constructor(contentManager : IVirtualStoredContentManager)
    {
        this.contentManager = contentManager;
        this.uid = 'VirtualStoredFSManager_1.3.3_' + contentManager.uid;
    }

    initialize(callback : (error : Error) => void)
    {
        this.contentManager.initialize(callback);
    }

    serialize(resource : any, obj : SerializedObject) : object
    {
        const result : any = {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties
        };

        result.name = resource.name;
        if(resource.contentUid)
        {
            result.len = resource.len;
            result.contentUid = resource.contentUid;
        }

        return result;
    }
    unserialize(data : any, obj : SerializedObject) : IResource
    {
        if(obj.type.isDirectory)
        {
            const rs = new VirtualStoredFolder(data.name, null, this);
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.properties = data.properties;
            return rs;
        }

        if(obj.type.isFile)
        {
            const rs = new VirtualStoredFile(data.name, null, this);
            rs.len = data.len === undefined ? 0 : data.len;
            rs.contentUid = data.contentUid;
            rs.dateCreation = data.dateCreation;
            rs.dateLastModified = data.dateLastModified;
            rs.properties = data.properties;
            return rs;
        }

        throw Errors.UnrecognizedResource;
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        if(type.isDirectory)
            return new VirtualStoredFolder(name, parent, this);
        if(type.isFile)
            return new VirtualStoredFile(name, parent, this);

        throw Errors.UnrecognizedResource;
    }
}
