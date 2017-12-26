import { RootFSManager, VirtualFSManager, PhysicalFSManager } from '../../../manager/v1/export'
import { SerializedObject, unserialize, serialize } from '../../../manager/v1/ISerializer'
import { SimpleCallback } from '../../../resource/v1/IResource'
import { FSManager } from '../../../manager/v1/FSManager'
import { Readable } from 'stream'
import * as zlib from 'zlib'
import * as fs from 'fs'

function defaultFSManagers()
{
    return [
        new RootFSManager(),
        new VirtualFSManager(),
        new PhysicalFSManager()
    ];
}

export function load(obj : SerializedObject, managers : FSManager[], callback: (error : Error) => void)
{
    unserialize(obj, managers ? managers : defaultFSManagers(), (e, r) => {
        if(!e)
        {
            this.rootResource = r;
            callback(null);
        }
        else
            callback(e);
    })
}

export function autoLoad(callback : SimpleCallback)
{
    const oStream = fs.createReadStream(this.options.autoLoad.treeFilePath);
    const stream = oStream.pipe(zlib.createGunzip());
    
    oStream.on('error', callback)
    stream.on('error', callback)

    let streamProvider = this.options.autoLoad.streamProvider;

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

            const fsManagers = this.options.autoLoad.fsManagers;
            this.load(obj, fsManagers ? fsManagers : defaultFSManagers(), callback);
        })
    })
}

export function save(callback : (error : Error, obj : any) => void)
{
    serialize(this.rootResource, callback);
}
